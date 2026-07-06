'use server'

import { AiClientError, completeChat } from '@/lib/ai-client'
import { client } from '@/lib/prisma'
import { getCurrentDbUser, hasWorkspaceAccess } from '@/lib/server/workspace-helpers'

const DAY_MS = 24 * 60 * 60 * 1000

const buildWorkspaceAiContext = async (
  workspaceId: string,
  userId: string
) => {
  const weekAgo = new Date(Date.now() - 7 * DAY_MS)

  const [
    workspace,
    members,
    tasks,
    videos,
    activities,
    notifications,
    videosShared,
    tasksCompleted,
    pendingTasks,
  ] = await Promise.all([
    client.workSpace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, createdAt: true },
    }),
    client.member.findMany({
      where: { workSpaceId: workspaceId },
      select: {
        createdAt: true,
        User: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    }),
    client.task.findMany({
      where: { workSpaceId: workspaceId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        assigneeId: true,
        Assignee: {
          select: { firstname: true, lastname: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    client.video.findMany({
      where: {
        OR: [
          { workSpaceId: workspaceId },
          { sharedIn: { some: { workSpaceId: workspaceId } } },
        ],
      },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    client.activity.findMany({
      where: { workSpaceId: workspaceId, createdAt: { gte: weekAgo } },
      select: { type: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    client.notification.findMany({
      where: { workSpaceId: workspaceId, userId },
      select: { content: true, type: true, read: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    client.sharedVideo.count({ where: { workSpaceId: workspaceId } }),
    client.task.count({
      where: { workSpaceId: workspaceId, status: 'DONE' },
    }),
    client.task.count({
      where: { workSpaceId: workspaceId, status: { not: 'DONE' } },
    }),
  ])

  if (!workspace) return null

  const memberList = members
    .map((m) => m.User)
    .filter(Boolean)
    .map((u) => ({
      name:
        `${u!.firstname ?? ''} ${u!.lastname ?? ''}`.trim() ||
        u!.email.split('@')[0],
      email: u!.email,
    }))

  const assigneeCounts = tasks.reduce<Record<string, number>>((acc, task) => {
    if (!task.Assignee) return acc
    const name =
      `${task.Assignee.firstname ?? ''} ${task.Assignee.lastname ?? ''}`.trim() ||
      task.Assignee.email.split('@')[0]
    acc[name] = (acc[name] ?? 0) + 1
    return acc
  }, {})

  const videosThisWeek = videos.filter(
    (v) => v.createdAt.getTime() >= weekAgo.getTime()
  )

  const currentUser = await client.user.findUnique({
    where: { id: userId },
    select: { firstname: true, lastname: true, email: true },
  })
  const currentUserName =
    `${currentUser?.firstname ?? ''} ${currentUser?.lastname ?? ''}`.trim() ||
    currentUser?.email?.split('@')[0] ||
    'You'

  const myOpenTasks = tasks
    .filter((t) => t.status !== 'DONE' && t.assigneeId === userId)
    .map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString().slice(0, 10) ?? null,
    }))

  return {
    workspace: {
      name: workspace.name,
      memberCount: memberList.length,
      videosShared,
      tasksCompleted,
      pendingTasks,
    },
    members: memberList,
    tasks: tasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.Assignee
        ? `${t.Assignee.firstname ?? ''} ${t.Assignee.lastname ?? ''}`.trim() ||
          t.Assignee.email.split('@')[0]
        : 'Unassigned',
      dueDate: t.dueDate?.toISOString().slice(0, 10) ?? null,
      createdAt: t.createdAt.toISOString(),
    })),
    taskAssignmentsByMember: assigneeCounts,
    videos: videos.map((v) => ({
      title: v.title ?? 'Untitled video',
      uploadedAt: v.createdAt.toISOString(),
    })),
    videosUploadedThisWeek: videosThisWeek.map((v) => ({
      title: v.title ?? 'Untitled video',
      uploadedAt: v.createdAt.toISOString(),
    })),
    recentActivity: activities.map((a) => ({
      type: a.type,
      content: a.content,
      at: a.createdAt.toISOString(),
    })),
    notifications: notifications.map((n) => ({
      type: n.type,
      content: n.content,
      read: n.read,
      at: n.createdAt.toISOString(),
    })),
    currentUser: {
      name: currentUserName,
      openAssignedTasks: myOpenTasks,
    },
    weekSummary: {
      newMembers: members.filter((m) => m.createdAt >= weekAgo).length,
      videosUploaded: videosThisWeek.length,
      tasksCreated: tasks.filter((t) => t.createdAt >= weekAgo).length,
      tasksCompleted: tasks.filter(
        (t) => t.status === 'DONE' && t.updatedAt >= weekAgo
      ).length,
      activityCount: activities.length,
    },
  }
}

export const askWorkspaceAssistant = async (
  workspaceId: string,
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 401, data: 'Please sign in to use the assistant.' }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: 'You do not have access to this workspace.' }

    const trimmed = message.trim()
    if (!trimmed) return { status: 400, data: 'Please enter a message.' }

    const context = await buildWorkspaceAiContext(workspaceId, dbUser.id)
    if (!context) return { status: 404, data: 'Workspace not found.' }

    const systemPrompt = `You are the ClipFlow workspace AI assistant.
Answer ONLY using the JSON workspace context below.
Never analyze video files, frames, or transcripts.
Never invent data that is not in the context.
Be concise, friendly, and use bullet lists when helpful.
If the answer is not in the context, say you do not have that information in the workspace data.

Workspace context JSON:
${JSON.stringify(context)}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-6).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user' as const, content: trimmed },
    ]

    const reply = await completeChat(messages, { maxTokens: 700 })

    return { status: 200, data: reply }
  } catch (error) {
    if (error instanceof AiClientError) {
      return { status: 503, data: error.message }
    }
    return {
      status: 500,
      data: 'The assistant is unavailable right now. Please try again.',
    }
  }
}

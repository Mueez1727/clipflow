'use server'

import { client } from '@/lib/prisma'
import {
  createNotification,
  getCurrentDbUser,
  logActivity,
  notifyWorkspaceMembers,
} from '@/lib/server/workspace-helpers'
import { TASK_PRIORITY, TASK_STATUS } from '@prisma/client'

const taskInclude = {
  Assignee: {
    select: { id: true, firstname: true, lastname: true, image: true },
  },
  Video: {
    select: { id: true, title: true },
  },
} as const

export const getWorkspaceTasks = async (workspaceId: string) => {
  try {
    const tasks = await client.task.findMany({
      where: { workSpaceId: workspaceId },
      include: taskInclude,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return { status: 200, data: tasks }
  } catch (error) {
    console.log(error)
    return { status: 500, data: [] }
  }
}

type CreateTaskInput = {
  workspaceId: string
  title: string
  description?: string
  status?: TASK_STATUS
  priority?: TASK_PRIORITY
  assigneeId?: string | null
  videoId?: string | null
  dueDate?: string | null
}

const actorName = (u: {
  firstname: string | null
  lastname: string | null
}) => `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || 'Someone'

export const createTask = async (input: CreateTaskInput) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }
    if (!input.title.trim())
      return { status: 400, data: 'Task title is required' }

    const task = await client.task.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        status: input.status ?? 'TODO',
        priority: input.priority ?? 'MEDIUM',
        assigneeId: input.assigneeId || null,
        videoId: input.videoId || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        workSpaceId: input.workspaceId,
        createdById: dbUser.id,
      },
      include: taskInclude,
    })

    if (task.assigneeId && task.assigneeId !== dbUser.id) {
      await createNotification({
        userId: task.assigneeId,
        actorId: dbUser.id,
        type: 'TASK_ASSIGNED',
        content: `${actorName(dbUser)} assigned you the task "${task.title}"`,
        workspaceId: input.workspaceId,
        link: `/dashboard/${input.workspaceId}/workspace?tab=tasks`,
      })
    }

    await notifyWorkspaceMembers({
      workspaceId: input.workspaceId,
      actorId: dbUser.id,
      type: 'TASK_CREATED',
      content: `${actorName(dbUser)} created task "${task.title}"`,
      link: `/dashboard/${input.workspaceId}/workspace?tab=tasks`,
    })

    if (task.Assignee) {
      await logActivity({
        workspaceId: input.workspaceId,
        type: 'TASK_ASSIGNED',
        content: `assigned "${task.title}" to ${actorName(task.Assignee)}`,
        userId: dbUser.id,
      })
    }

    return { status: 200, data: task }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to create task' }
  }
}

type UpdateTaskInput = {
  taskId: string
  title?: string
  description?: string | null
  status?: TASK_STATUS
  priority?: TASK_PRIORITY
  assigneeId?: string | null
  videoId?: string | null
  dueDate?: string | null
}

export const updateTask = async (input: UpdateTaskInput) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const previous = await client.task.findUnique({
      where: { id: input.taskId },
      select: { assigneeId: true, status: true, workSpaceId: true, title: true },
    })
    if (!previous) return { status: 404, data: 'Task not found' }

    const task = await client.task.update({
      where: { id: input.taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description?.trim() || null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.assigneeId !== undefined
          ? { assigneeId: input.assigneeId || null }
          : {}),
        ...(input.videoId !== undefined
          ? { videoId: input.videoId || null }
          : {}),
        ...(input.dueDate !== undefined
          ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
          : {}),
      },
      include: taskInclude,
    })

    if (
      input.assigneeId &&
      input.assigneeId !== previous.assigneeId &&
      input.assigneeId !== dbUser.id
    ) {
      await createNotification({
        userId: input.assigneeId,
        actorId: dbUser.id,
        type: 'TASK_ASSIGNED',
        content: `${actorName(dbUser)} assigned you the task "${task.title}"`,
        workspaceId: previous.workSpaceId,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
    }

    const statusChanged =
      input.status !== undefined && input.status !== previous.status

    if (statusChanged && input.status === 'IN_PROGRESS') {
      await notifyWorkspaceMembers({
        workspaceId: previous.workSpaceId,
        actorId: dbUser.id,
        type: 'TASK_IN_PROGRESS',
        content: `${actorName(dbUser)} moved "${task.title}" to In Progress`,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
    }

    if (statusChanged && input.status === 'DONE' && previous.status !== 'DONE') {
      await notifyWorkspaceMembers({
        workspaceId: previous.workSpaceId,
        actorId: dbUser.id,
        type: 'TASK_COMPLETED',
        content: `${actorName(dbUser)} completed "${task.title}"`,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
      await logActivity({
        workspaceId: previous.workSpaceId,
        type: 'TASK_COMPLETED',
        content: `completed "${task.title}"`,
        userId: dbUser.id,
      })
    } else if (
      !statusChanged &&
      (input.title !== undefined ||
        input.description !== undefined ||
        input.priority !== undefined ||
        input.dueDate !== undefined)
    ) {
      await notifyWorkspaceMembers({
        workspaceId: previous.workSpaceId,
        actorId: dbUser.id,
        type: 'TASK_UPDATED',
        content: `${actorName(dbUser)} updated "${task.title}"`,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
    }

    return { status: 200, data: task }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to update task' }
  }
}

export const moveTask = async (taskId: string, status: TASK_STATUS) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    const previous = await client.task.findUnique({
      where: { id: taskId },
      select: { status: true, workSpaceId: true, title: true },
    })
    if (!previous) return { status: 404, data: 'Task not found' }

    await client.task.update({
      where: { id: taskId },
      data: { status },
    })

    if (status === 'IN_PROGRESS' && previous.status !== 'IN_PROGRESS') {
      await notifyWorkspaceMembers({
        workspaceId: previous.workSpaceId,
        actorId: dbUser.id,
        type: 'TASK_IN_PROGRESS',
        content: `${actorName(dbUser)} moved "${previous.title}" to In Progress`,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
    }

    if (status === 'DONE' && previous.status !== 'DONE') {
      await notifyWorkspaceMembers({
        workspaceId: previous.workSpaceId,
        actorId: dbUser.id,
        type: 'TASK_COMPLETED',
        content: `${actorName(dbUser)} completed "${previous.title}"`,
        link: `/dashboard/${previous.workSpaceId}/workspace?tab=tasks`,
      })
      await logActivity({
        workspaceId: previous.workSpaceId,
        type: 'TASK_COMPLETED',
        content: `completed "${previous.title}"`,
        userId: dbUser.id,
      })
    }

    return { status: 200, data: 'Task moved' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to move task' }
  }
}

export const deleteTask = async (taskId: string) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 404, data: 'User not found' }

    await client.task.delete({ where: { id: taskId } })
    return { status: 200, data: 'Task deleted' }
  } catch (error) {
    console.log(error)
    return { status: 500, data: 'Failed to delete task' }
  }
}

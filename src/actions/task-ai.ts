'use server'

import { AiClientError, completeChat, parseJsonFromAi } from '@/lib/ai-client'
import { getCurrentDbUser, hasWorkspaceAccess } from '@/lib/server/workspace-helpers'
import { TASK_PRIORITY } from '@prisma/client'

export type GeneratedTaskDraft = {
  title: string
  description: string
  priority: TASK_PRIORITY
  estimatedTime: string
  suggestedDeadline: string
}

const PRIORITIES: TASK_PRIORITY[] = ['HIGH', 'MEDIUM', 'LOW']

export const generateTaskFromIdea = async (
  workspaceId: string,
  idea: string
) => {
  try {
    const dbUser = await getCurrentDbUser()
    if (!dbUser) return { status: 401, data: 'Please sign in to use AI task generation.' }

    const allowed = await hasWorkspaceAccess(workspaceId, dbUser.id)
    if (!allowed) return { status: 403, data: 'You do not have access to this workspace.' }

    const trimmed = idea.trim()
    if (!trimmed) return { status: 400, data: 'Describe your task idea first.' }

    const prompt = `Generate a task draft from this idea: "${trimmed}"

Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "description": "string (2-3 sentences, actionable)",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedTime": "string like 2 hours or 30 minutes",
  "suggestedDeadline": "YYYY-MM-DD (realistic date within 14 days from today)"
}

Today is ${new Date().toISOString().slice(0, 10)}.
Do not include markdown or extra text.`

    const raw = await completeChat(
      [
        {
          role: 'system',
          content:
            'You are a project planning assistant. Output strict JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.2, maxTokens: 500 }
    )

    const parsed = parseJsonFromAi<GeneratedTaskDraft>(raw)

    const priority = PRIORITIES.includes(parsed.priority)
      ? parsed.priority
      : 'MEDIUM'

    const draft: GeneratedTaskDraft = {
      title: parsed.title?.trim() || trimmed,
      description: parsed.description?.trim() || trimmed,
      priority,
      estimatedTime: parsed.estimatedTime?.trim() || '2 hours',
      suggestedDeadline:
        parsed.suggestedDeadline?.trim() ||
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
    }

    return { status: 200, data: draft }
  } catch (error) {
    console.log('generateTaskFromIdea error', error)
    if (error instanceof AiClientError) {
      return { status: 503, data: error.message }
    }
    return {
      status: 500,
      data: 'Could not generate task details. Please try again or fill the form manually.',
    }
  }
}

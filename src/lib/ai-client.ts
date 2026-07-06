const AI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'
const DEFAULT_MODEL = 'glm-4-flash'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AiClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiClientError'
  }
}

export const completeChat = async (
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> => {
  const apiKey = process.env.OPEN_AI_KEY
  if (!apiKey) {
    throw new AiClientError(
      'AI is not configured. Add OPEN_AI_KEY to your environment.'
    )
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 800,
    }),
  })

  if (!response.ok) {
    console.log('AI API error', await response.text())
    throw new AiClientError('AI request failed. Please try again.')
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }

  const text = payload.choices?.[0]?.message?.content?.trim()
  if (!text) {
    throw new AiClientError('AI returned an empty response.')
  }

  return text
}

export const parseJsonFromAi = <T>(raw: string): T => {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  return JSON.parse(candidate) as T
}

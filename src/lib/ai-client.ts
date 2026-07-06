const AI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'
const DEFAULT_MODEL = process.env.AI_MODEL ?? 'glm-4.7-flash'

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

const resolveApiKey = () => {
  const key = process.env.OPEN_AI_KEY?.trim()
  if (!key) {
    throw new AiClientError(
      'AI is not configured. Set OPEN_AI_KEY in your environment.'
    )
  }
  return key
}

export const completeChat = async (
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> => {
  const apiKey = resolveApiKey()

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'en-US,en',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 800,
      stream: false,
    }),
  })

  const raw = await response.text()

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const parsed = JSON.parse(raw) as {
        error?: { message?: string; code?: string }
        message?: string
      }
      detail =
        parsed.error?.message ??
        parsed.message ??
        raw.slice(0, 200) ??
        detail
    } catch {
      if (raw) detail = raw.slice(0, 200)
    }
    throw new AiClientError(`AI request failed: ${detail}`)
  }

  let payload: { choices?: { message?: { content?: string } }[] }
  try {
    payload = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[]
    }
  } catch {
    throw new AiClientError('AI returned an unreadable response.')
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

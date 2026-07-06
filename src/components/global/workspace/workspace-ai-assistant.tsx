'use client'

import { askWorkspaceAssistant } from '@/actions/workspace-ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Loader2, Send, Sparkles } from 'lucide-react'
import React, { useCallback, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  workspaceId: string
}

const WorkspaceAiAssistant = ({ workspaceId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || isPending) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    scrollToBottom()

    startTransition(async () => {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const result = await askWorkspaceAssistant(workspaceId, text, history)

      const reply =
        result.status === 200 && typeof result.data === 'string'
          ? result.data
          : typeof result.data === 'string'
            ? result.data
            : 'The assistant could not respond right now.'

      if (result.status !== 200) {
        toast.error('Assistant unavailable', { description: reply })
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
        },
      ])
      scrollToBottom()
    })
  }, [input, isPending, messages, scrollToBottom, workspaceId])

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
          <p className="text-xs text-muted-foreground">
            Answers from live workspace data only
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Sparkles className="h-8 w-8 text-[#7C3AED]/40" />
            <p>Ask about tasks, members, videos, or what changed this week.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'ml-auto bg-[#7C3AED] text-white'
                  : 'mr-auto border border-border bg-muted/40 text-foreground'
              )}
            >
              {msg.content}
            </div>
          ))
        )}
        {isPending && (
          <div className="mr-auto flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#7C3AED]" />
            Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Ask about tasks, members, videos…"
            rows={2}
            disabled={isPending}
            className="min-h-[44px] resize-none"
          />
          <Button
            type="button"
            onClick={send}
            disabled={!input.trim() || isPending}
            className="clipflow-gradient shrink-0 self-end text-white"
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(WorkspaceAiAssistant)

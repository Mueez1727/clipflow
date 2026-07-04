'use client'

import {
  getWorkspaceMembers,
  getWorkspaceMessages,
  sendWorkspaceMessage,
} from '@/actions/collab-workspace'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useQueryData } from '@/hooks/useQueryData'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { ImageIcon, Send, Smile } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import MentionTextarea, { MentionMember } from './mention-textarea'
import WorkspaceAvatar from './workspace-avatar'

const MENTION_SPLIT = /(@[a-zA-Z0-9_.-]+)/g

const renderMessage = (content: string, own: boolean) =>
  content.split(MENTION_SPLIT).map((part, index) =>
    part.startsWith('@') ? (
      <span
        key={index}
        className={cn('font-semibold', own ? 'text-white' : 'text-[#7C3AED]')}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  )

type ChatMessage = {
  id: string
  content: string
  createdAt: Date
  userId: string | null
  isOwn: boolean
  User: {
    id: string
    firstname: string | null
    lastname: string | null
    image: string | null
  } | null
}

const EMOJIS = ['😀', '😂', '🔥', '👍', '🎉', '❤️', '🚀', '👀', '✅', '💡', '🙌', '😎']

const WorkspaceChat = ({ workspaceId }: { workspaceId: string }) => {
  const [value, setValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const { data, refetch } = useQuery({
    queryKey: ['workspace-messages', workspaceId],
    queryFn: () => getWorkspaceMessages(workspaceId),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  })

  const { data: membersData } = useQueryData(
    ['workspace-members', workspaceId],
    () => getWorkspaceMembers(workspaceId)
  )
  const members = ((membersData as { data: MentionMember[] } | undefined)?.data ??
    []) as MentionMember[]

  const messages = useMemo(
    () => ((data as { status: number; data: ChatMessage[] })?.data ?? []),
    [data]
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const submitMessage = async () => {
    const content = value.trim()
    if (!content || isSending) return
    setIsSending(true)
    setValue('')
    const result = await sendWorkspaceMessage(workspaceId, content)
    setIsSending(false)
    if (result.status === 200) {
      await refetch()
    } else {
      toast(typeof result.data === 'string' ? result.data : 'Failed to send')
      setValue(content)
    }
  }

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitMessage()
  }

  const appendEmoji = (emoji: string) => {
    setValue((prev) => prev + emoji)
  }

  return (
    <div className="flex h-[calc(100vh-320px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <h3 className="font-semibold text-foreground">Team Chat</h3>
        </div>
        <span className="text-xs text-muted-foreground">Live</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C3AED]/10 text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground">
              Say hello to your team and start the conversation.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const name = message.User?.firstname
              ? `${message.User.firstname} ${message.User.lastname ?? ''}`.trim()
              : 'Member'
            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2.5',
                  message.isOwn ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {message.User?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.User.image}
                    alt={name}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <WorkspaceAvatar
                    name={name}
                    className="h-8 w-8 shrink-0 rounded-full text-xs"
                  />
                )}
                <div
                  className={cn(
                    'max-w-[75%] space-y-1',
                    message.isOwn ? 'items-end text-right' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'inline-block rounded-2xl px-4 py-2 text-sm shadow-sm',
                      message.isOwn
                        ? 'rounded-br-sm bg-[#7C3AED] text-white'
                        : 'rounded-bl-sm bg-muted text-foreground'
                    )}
                  >
                    {!message.isOwn && (
                      <p className="mb-0.5 text-xs font-semibold text-[#7C3AED]">
                        {name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">
                      {renderMessage(message.content, message.isOwn)}
                    </p>
                  </div>
                  <p className="px-1 text-[10px] text-muted-foreground">
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator placeholder (ready for realtime integration) */}
        <div className="hidden items-center gap-2" data-typing-indicator>
          <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSend}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-muted-foreground"
              aria-label="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => appendEmoji(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          aria-label="Attach image (coming soon)"
          title="Image attachments coming soon"
          onClick={() => toast('Image attachments coming soon')}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <MentionTextarea
            value={value}
            onChange={setValue}
            members={members}
            rows={1}
            onEnter={submitMessage}
            placeholder="Type a message... use @ to mention"
            className="rounded-2xl bg-muted/40"
          />
        </div>

        <Button
          type="submit"
          size="icon"
          className="btn-clipflow h-9 w-9 shrink-0 rounded-full"
          disabled={!value.trim() || isSending}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

export default WorkspaceChat

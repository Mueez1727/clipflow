'use client'

import { cn } from '@/lib/utils'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import WorkspaceAvatar from './workspace-avatar'

export type MentionMember = {
  id: string
  firstname: string | null
  lastname: string | null
  image: string | null
  email: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  members: MentionMember[]
  placeholder?: string
  className?: string
  rows?: number
  disabled?: boolean
  onEnter?: () => void
}

const memberHandle = (m: MentionMember) =>
  (m.firstname ?? m.email.split('@')[0]).replace(/\s+/g, '')

const memberName = (m: MentionMember) =>
  `${m.firstname ?? ''} ${m.lastname ?? ''}`.trim() || m.email.split('@')[0]

const MentionTextarea = ({
  value,
  onChange,
  members,
  placeholder,
  className,
  rows = 3,
  disabled,
  onEnter,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tokenStart, setTokenStart] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = useMemo(() => {
    if (!open) return []
    const q = query.toLowerCase()
    return members
      .filter((m) => {
        const name = memberName(m).toLowerCase()
        return name.includes(q) || m.email.toLowerCase().includes(q)
      })
      .slice(0, 6)
  }, [open, query, members])

  const detectMention = useCallback(
    (text: string, caret: number) => {
      let i = caret - 1
      while (i >= 0 && /[a-zA-Z0-9_.-]/.test(text[i])) i--
      if (i >= 0 && text[i] === '@') {
        const before = i === 0 ? '' : text[i - 1]
        if (before === '' || /\s/.test(before)) {
          setTokenStart(i)
          setQuery(text.slice(i + 1, caret))
          setOpen(true)
          setActiveIndex(0)
          return
        }
      }
      setOpen(false)
      setTokenStart(null)
    },
    []
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    onChange(next)
    detectMention(next, e.target.selectionStart ?? next.length)
  }

  const insertMention = (member: MentionMember) => {
    if (tokenStart === null || !textareaRef.current) return
    const caret = textareaRef.current.selectionStart ?? value.length
    const handle = memberHandle(member)
    const nextValue =
      value.slice(0, tokenStart) + `@${handle} ` + value.slice(caret)
    onChange(nextValue)
    setOpen(false)
    setTokenStart(null)
    const nextCaret = tokenStart + handle.length + 2
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(nextCaret, nextCaret)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % suggestions.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(suggestions[activeIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && onEnter) {
      e.preventDefault()
      onEnter()
    }
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 disabled:opacity-60',
          className
        )}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-fade-in">
          {suggestions.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                insertMention(member)
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                index === activeIndex ? 'bg-accent' : 'hover:bg-accent/60'
              )}
            >
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image}
                  alt={memberName(member)}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <WorkspaceAvatar
                  name={memberName(member)}
                  className="h-7 w-7 shrink-0 rounded-full text-[10px]"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {memberName(member)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{memberHandle(member)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MentionTextarea

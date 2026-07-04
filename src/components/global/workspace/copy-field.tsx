'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  label: string
  value: string
  className?: string
}

const CopyField = ({ label, value, className }: Props) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast('Copied to clipboard')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast('Unable to copy')
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1 pl-3">
        <span className="flex-1 truncate font-mono text-sm text-foreground">
          {value}
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onCopy}
          className="h-8 w-8 shrink-0"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default CopyField

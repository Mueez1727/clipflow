import { Links } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'
import { toast } from 'sonner'

type Props = {
  videoId: string
  className?: string
  iconOnly?: boolean
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
}

const CopyLink = ({ videoId, className, variant, iconOnly }: Props) => {
  const onCopyClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_HOST_URL}/preview/${videoId}`
    )
    toast('Copied', {
      description: 'Link successfully copied',
    })
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        aria-label="Copy link"
        onClick={onCopyClipboard}
        className={cn(className, '[&_svg]:h-4 [&_svg]:w-4')}
      >
        <Links />
      </button>
    )
  }

  return (
    <Button variant={variant} onClick={onCopyClipboard} className={className}>
      <Links />
    </Button>
  )
}

export default CopyLink

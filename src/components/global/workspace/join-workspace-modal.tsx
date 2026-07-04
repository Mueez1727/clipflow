'use client'

import { joinWorkspaceByCode } from '@/actions/collab-workspace'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

const extractCode = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  const match = value.match(/\/join\/([^/?#\s]+)/i)
  return (match ? match[1] : value).toUpperCase()
}

type Props = {
  trigger: React.ReactNode
}

const JoinWorkspaceModal = ({ trigger }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = extractCode(value)
    if (!code) return
    setIsSubmitting(true)
    const result = await joinWorkspaceByCode(code)
    setIsSubmitting(false)

    if (result.status === 200 && typeof result.data === 'object') {
      queryClient.invalidateQueries({ queryKey: ['joined-workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['user-workspaces'] })
      toast(`Joined ${result.data.name}`)
      setOpen(false)
      setValue('')
      router.push(`/dashboard/${result.data.id}/workspace`)
    } else {
      toast(typeof result.data === 'string' ? result.data : 'Unable to join')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Join a Workspace</DialogTitle>
            <DialogDescription>
              Enter a join code (e.g. ABCD1234) or paste a workspace invite link.
            </DialogDescription>
          </DialogHeader>
          <div className="py-5">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Join Code or Link
            </label>
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ABCD1234"
              className="font-mono uppercase tracking-widest placeholder:tracking-normal placeholder:normal-case"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-clipflow gap-2"
              disabled={!value.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Join Workspace
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default JoinWorkspaceModal

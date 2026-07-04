'use client'

import { createCollabWorkspace } from '@/actions/collab-workspace'
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
import { Loader2, PartyPopper } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import CopyField from './copy-field'

type CreatedWorkspace = {
  id: string
  name: string
  inviteCode: string | null
}

type Props = {
  trigger: React.ReactNode
}

const CreateWorkspaceModal = ({ trigger }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState<CreatedWorkspace | null>(null)

  const hostUrl =
    process.env.NEXT_PUBLIC_HOST_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  const resetState = () => {
    setName('')
    setCreated(null)
    setIsSubmitting(false)
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setTimeout(resetState, 200)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    const result = await createCollabWorkspace(name)
    setIsSubmitting(false)

    if (result.status === 201 && typeof result.data === 'object') {
      setCreated(result.data as CreatedWorkspace)
      queryClient.invalidateQueries({ queryKey: ['joined-workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['user-workspaces'] })
      toast('Workspace created')
    } else {
      toast(typeof result.data === 'string' ? result.data : 'Something went wrong')
    }
  }

  const joinLink = created?.inviteCode
    ? `${hostUrl}/join/${created.inviteCode}`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {!created ? (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create a Workspace</DialogTitle>
              <DialogDescription>
                Collaborate with your team. Share videos, chat, and work together
                in one place.
              </DialogDescription>
            </DialogHeader>
            <div className="py-5">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Workspace Name
              </label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-clipflow gap-2"
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Workspace
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <DialogHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <PartyPopper className="h-6 w-6 text-emerald-500" />
              </div>
              <DialogTitle>{created.name} is ready!</DialogTitle>
              <DialogDescription>
                Share the join code or link below so others can join your
                workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <CopyField label="Join Code" value={created.inviteCode ?? ''} />
              <CopyField label="Join Link" value={joinLink} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Done
              </Button>
              <Button
                className="btn-clipflow"
                onClick={() => {
                  onOpenChange(false)
                  router.push(`/dashboard/${created.id}/workspace`)
                }}
              >
                Open Workspace
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspaceModal

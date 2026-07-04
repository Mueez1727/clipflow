'use client'

import { createTask, updateTask } from '@/actions/tasks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useMutationData } from '@/hooks/useMutationData'
import { TASK_PRIORITY, TASK_STATUS } from '@prisma/client'
import React, { useEffect, useState } from 'react'

export type TaskMember = {
  id: string
  firstname: string | null
  lastname: string | null
  image: string | null
}

export type TaskVideo = {
  id: string
  title: string | null
}

export type EditableTask = {
  id: string
  title: string
  description: string | null
  status: TASK_STATUS
  priority: TASK_PRIORITY
  assigneeId: string | null
  videoId: string | null
  dueDate: string | Date | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  members: TaskMember[]
  videos: TaskVideo[]
  task?: EditableTask | null
  defaultStatus?: TASK_STATUS
}

const NONE = 'none'

const toDateInput = (value: string | Date | null | undefined) => {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const memberName = (m: TaskMember) =>
  `${m.firstname ?? ''} ${m.lastname ?? ''}`.trim() || 'Member'

const TaskDialog = ({
  open,
  onOpenChange,
  workspaceId,
  members,
  videos,
  task,
  defaultStatus = 'TODO',
}: Props) => {
  const isEdit = Boolean(task)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TASK_STATUS>(defaultStatus)
  const [priority, setPriority] = useState<TASK_PRIORITY>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>(NONE)
  const [videoId, setVideoId] = useState<string>(NONE)
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setStatus(task?.status ?? defaultStatus)
    setPriority(task?.priority ?? 'MEDIUM')
    setAssigneeId(task?.assigneeId ?? NONE)
    setVideoId(task?.videoId ?? NONE)
    setDueDate(toDateInput(task?.dueDate))
  }, [open, task, defaultStatus])

  const { mutate: create, isPending: creating } = useMutationData(
    ['create-task'],
    async (payload: Record<string, unknown>) => {
      const res = await createTask({
        workspaceId,
        title: payload.title as string,
        description: payload.description as string,
        status: payload.status as TASK_STATUS,
        priority: payload.priority as TASK_PRIORITY,
        assigneeId: payload.assigneeId as string | null,
        videoId: payload.videoId as string | null,
        dueDate: payload.dueDate as string | null,
      })
      return {
        status: res.status,
        data: typeof res.data === 'string' ? res.data : 'Task created',
      }
    },
    `workspace-tasks-${workspaceId}`,
    () => onOpenChange(false)
  )

  const { mutate: update, isPending: updating } = useMutationData(
    ['update-task'],
    async (payload: Record<string, unknown>) => {
      const res = await updateTask({
        taskId: task!.id,
        title: payload.title as string,
        description: payload.description as string,
        status: payload.status as TASK_STATUS,
        priority: payload.priority as TASK_PRIORITY,
        assigneeId: payload.assigneeId as string | null,
        videoId: payload.videoId as string | null,
        dueDate: payload.dueDate as string | null,
      })
      return {
        status: res.status,
        data: typeof res.data === 'string' ? res.data : 'Task updated',
      }
    },
    `workspace-tasks-${workspaceId}`,
    () => onOpenChange(false)
  )

  const submit = () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId === NONE ? null : assigneeId,
      videoId: videoId === NONE ? null : videoId,
      dueDate: dueDate || null,
    }
    if (isEdit) update(payload)
    else create(payload)
  }

  const isPending = creating || updating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TASK_STATUS)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TASK_PRIORITY)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {memberName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Related video (optional)</Label>
            <Select value={videoId} onValueChange={setVideoId}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {videos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title ?? 'Untitled video'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!title.trim() || isPending}
            className="clipflow-gradient text-white"
          >
            {isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog

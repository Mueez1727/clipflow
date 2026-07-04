'use client'

import { getWorkspaceMembers, getWorkspaceSharedVideos } from '@/actions/collab-workspace'
import { deleteTask, getWorkspaceTasks, moveTask } from '@/actions/tasks'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutationData } from '@/hooks/useMutationData'
import { useQueryData } from '@/hooks/useQueryData'
import { cn } from '@/lib/utils'
import { TASK_PRIORITY, TASK_STATUS } from '@prisma/client'
import {
  CalendarDays,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video as VideoIcon,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import TaskDialog, {
  EditableTask,
  TaskMember,
  TaskVideo,
} from './task-dialog'
import WorkspaceAvatar from './workspace-avatar'

type TaskItem = {
  id: string
  title: string
  description: string | null
  status: TASK_STATUS
  priority: TASK_PRIORITY
  dueDate: string | Date | null
  assigneeId: string | null
  videoId: string | null
  Assignee: TaskMember | null
  Video: { id: string; title: string | null } | null
}

const COLUMNS: { id: TASK_STATUS; title: string; dot: string }[] = [
  { id: 'TODO', title: 'To Do', dot: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-blue-500' },
  { id: 'DONE', title: 'Done', dot: 'bg-emerald-500' },
]

const PRIORITY_STYLES: Record<TASK_PRIORITY, string> = {
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

const memberName = (m: TaskMember | null) =>
  m ? `${m.firstname ?? ''} ${m.lastname ?? ''}`.trim() || 'Member' : ''

const formatDue = (value: string | Date | null) => {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const TaskBoard = ({ workspaceId }: { workspaceId: string }) => {
  const tasksKey = `workspace-tasks-${workspaceId}`

  const { data, isPending } = useQueryData([tasksKey], () =>
    getWorkspaceTasks(workspaceId)
  )
  const { data: membersData } = useQueryData(
    ['workspace-members', workspaceId],
    () => getWorkspaceMembers(workspaceId)
  )
  const { data: videosData } = useQueryData(['workspace-videos', workspaceId], () =>
    getWorkspaceSharedVideos(workspaceId)
  )

  const serverTasks = (data as { data: TaskItem[] } | undefined)?.data ?? []
  const members = ((membersData as { data: TaskMember[] } | undefined)?.data ??
    []) as TaskMember[]
  const videos = ((videosData as { data: TaskVideo[] } | undefined)?.data ??
    []) as TaskVideo[]

  const [localTasks, setLocalTasks] = useState<TaskItem[]>([])
  useEffect(() => {
    setLocalTasks(serverTasks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const [search, setSearch] = useState('')
  const [memberFilter, setMemberFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TASK_STATUS | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<EditableTask | null>(null)
  const [createStatus, setCreateStatus] = useState<TASK_STATUS>('TODO')

  const { mutate: move } = useMutationData(
    ['move-task'],
    (payload: { taskId: string; status: TASK_STATUS }) =>
      moveTask(payload.taskId, payload.status),
    tasksKey
  )

  const { mutate: removeTask } = useMutationData(
    ['delete-task'],
    (payload: { taskId: string }) => deleteTask(payload.taskId),
    tasksKey
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return localTasks.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
      const matchesMember =
        memberFilter === 'all' || t.assigneeId === memberFilter
      const matchesPriority =
        priorityFilter === 'all' || t.priority === priorityFilter
      return matchesSearch && matchesMember && matchesPriority
    })
  }, [localTasks, search, memberFilter, priorityFilter])

  const openCreate = (status: TASK_STATUS) => {
    setEditingTask(null)
    setCreateStatus(status)
    setDialogOpen(true)
  }

  const openEdit = (task: TaskItem) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      videoId: task.videoId,
      dueDate: task.dueDate,
    })
    setDialogOpen(true)
  }

  const handleDrop = (status: TASK_STATUS) => {
    setDragOverColumn(null)
    if (!draggingId) return
    const task = localTasks.find((t) => t.id === draggingId)
    setDraggingId(null)
    if (!task || task.status === status) return
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    )
    move({ taskId: task.id, status })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Task Board</h2>
          <p className="text-sm text-muted-foreground">
            Plan and track work across your workspace.
          </p>
        </div>
        <Button
          onClick={() => openCreate('TODO')}
          className="clipflow-gradient gap-2 rounded-full text-white"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <Select value={memberFilter} onValueChange={setMemberFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {memberName(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((c) => (
            <Skeleton key={c.id} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnTasks = filtered.filter((t) => t.status === column.id)
            return (
              <div
                key={column.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverColumn(column.id)
                }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(column.id)}
                className={cn(
                  'flex flex-col rounded-2xl border border-border bg-muted/30 p-3 transition-colors',
                  dragOverColumn === column.id &&
                    'border-[#7C3AED]/50 bg-[#7C3AED]/5'
                )}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', column.dot)} />
                    <span className="text-sm font-semibold text-foreground">
                      {column.title}
                    </span>
                    <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreate(column.id)}
                    className="text-muted-foreground transition-colors hover:text-[#7C3AED]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex min-h-[120px] flex-col gap-2.5">
                  {columnTasks.map((task) => {
                    const due = formatDue(task.dueDate)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggingId(task.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={cn(
                          'group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing',
                          draggingId === task.id && 'opacity-50'
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-foreground">
                            {task.title}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 data-[state=open]:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(task)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => removeTask({ taskId: task.id })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {task.description && (
                          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}

                        {task.Video && (
                          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <VideoIcon className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {task.Video.title ?? 'Video'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase',
                                PRIORITY_STYLES[task.priority]
                              )}
                            >
                              {task.priority}
                            </span>
                            {due && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <CalendarDays className="h-3 w-3" />
                                {due}
                              </span>
                            )}
                          </div>
                          {task.Assignee &&
                            (task.Assignee.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={task.Assignee.image}
                                alt={memberName(task.Assignee)}
                                title={memberName(task.Assignee)}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <WorkspaceAvatar
                                name={memberName(task.Assignee)}
                                className="h-6 w-6 rounded-full text-[10px]"
                              />
                            ))}
                        </div>
                      </div>
                    )
                  })}

                  {columnTasks.length === 0 && (
                    <button
                      type="button"
                      onClick={() => openCreate(column.id)}
                      className="rounded-xl border border-dashed border-border py-6 text-xs text-muted-foreground transition-colors hover:border-[#7C3AED]/40 hover:text-foreground"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspaceId}
        members={members}
        videos={videos}
        task={editingTask}
        defaultStatus={createStatus}
      />
    </div>
  )
}

export default TaskBoard

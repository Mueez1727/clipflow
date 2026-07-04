'use client'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import Loader from '../loader'
import FolderDuotone from '@/components/icons/folder-duotone'
import { useMutationData, useMutationDataState } from '@/hooks/useMutationData'
import { renameFolders } from '@/actions/workspace'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteFolder } from '@/hooks/useDeleteFolder'
import { useArchiveFolder } from '@/hooks/useArchiveFolder'
import { MoreVertical, Pencil, Trash2, Archive } from 'lucide-react'

type Props = {
  name: string
  id: string
  optimistic?: boolean
  count?: number
}

const Folder = ({ id, name, optimistic, count }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const folderCardRef = useRef<HTMLDivElement | null>(null)
  const pathName = usePathname()
  const router = useRouter()
  const [onRename, setOnRename] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(name)

  const Rename = () => setOnRename(true)
  const Renamed = () => setOnRename(false)

  type RenameFolderData = {
    id: string
    name: string
  }

  type RenameFolderVariables = {
    id: string
    name: string
  }

  const { mutate, isPending } = useMutationData<RenameFolderData>(
    ['rename-folders'],
    (data) => renameFolders(data.id, data.name),
    'workspace-folders',
    Renamed
  )

  const { deleteFolder, isPending: isDeleting } = useDeleteFolder()
  const { archiveFolder, isPending: isArchiving } = useArchiveFolder()

  const { latestVariables } = useMutationDataState(['rename-folders']) as {
    latestVariables?: {
      status: string
      variables: RenameFolderVariables
    }
  }

  const displayName =
    latestVariables &&
    latestVariables.status === 'pending' &&
    latestVariables.variables.id === id
      ? latestVariables.variables.name
      : name

  const handleFolderClick = () => {
    if (onRename || renameDialogOpen || deleteDialogOpen) return
    router.push(`${pathName}/folder/${id}`)
  }

  const handleNameDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation()
    Rename()
  }

  const updateFolderName = () => {
    if (inputRef.current) {
      if (inputRef.current.value) {
        mutate({ name: inputRef.current.value, id })
      } else Renamed()
    }
  }

  const openRenameDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameValue(displayName)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialogOpen(true)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (renameValue.trim()) {
      mutate({ name: renameValue.trim(), id })
      setRenameDialogOpen(false)
    }
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    archiveFolder({ id })
  }

  const handleDeleteConfirm = () => {
    deleteFolder({ id })
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <div
        onClick={handleFolderClick}
        ref={folderCardRef}
        className={cn(
          optimistic && 'opacity-60',
          'group relative flex min-w-[250px] cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg'
        )}
      >
        {!optimistic && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-70 transition-opacity duration-200 hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={openRenameDialog}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={openDeleteDialog}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Loader state={isPending || isDeleting || isArchiving}>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex flex-col gap-1">
              {onRename ? (
                <Input
                  onBlur={() => {
                    updateFolderName()
                  }}
                  autoFocus
                  placeholder={name}
                  className="h-8 border-none bg-transparent p-0 text-base text-foreground outline-none"
                  ref={inputRef}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-foreground"
                  onDoubleClick={handleNameDoubleClick}
                >
                  {displayName}
                </p>
              )}
              <span className="text-sm text-muted-foreground">
                {count || 0} videos
              </span>
            </div>
            <FolderDuotone />
          </div>
        </Loader>
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Folder name"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-clipflow" disabled={!renameValue.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{displayName}&quot; and all videos inside
              it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Folder

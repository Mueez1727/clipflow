'use client'
import { cn } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import FolderDuotone from '@/components/icons/folder-duotone'
import { useMutationDataState } from '@/hooks/useMutationData'
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteFolder } from '@/hooks/useDeleteFolder'
import { useArchiveFolder } from '@/hooks/useArchiveFolder'
import { useRenameFolder } from '@/hooks/useRenameFolder'
import { MoreVertical, Pencil, Trash2, Archive } from 'lucide-react'

type Props = {
  name: string
  id: string
  workspaceId: string
  optimistic?: boolean
  count?: number
}

const Folder = ({ id, name, workspaceId, optimistic, count }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pathName = usePathname()
  const router = useRouter()
  const [onRename, setOnRename] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(name)

  const closeRenameDialog = () => {
    setRenameDialogOpen(false)
    setRenameValue(name)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
  }

  const { renameFolder, isPending: isRenaming } = useRenameFolder(
    workspaceId,
    () => {
      setOnRename(false)
      closeRenameDialog()
    }
  )

  const { deleteFolder, isPending: isDeleting } = useDeleteFolder(workspaceId)
  const { archiveFolder, isPending: isArchiving } = useArchiveFolder(workspaceId)

  type RenameFolderVariables = {
    id: string
    name: string
  }

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

  const isBusy = isRenaming || isDeleting || isArchiving

  const handleFolderClick = () => {
    if (onRename || renameDialogOpen || deleteDialogOpen || menuOpen || isBusy) {
      return
    }
    router.push(`${pathName}/folder/${id}`)
  }

  const handleNameDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation()
    setOnRename(true)
  }

  const updateFolderName = () => {
    const value = inputRef.current?.value?.trim()
    if (value) {
      renameFolder({ name: value, id })
    } else {
      setOnRename(false)
    }
  }

  const openRenameDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setRenameValue(displayName)
    setRenameDialogOpen(true)
  }

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setDeleteDialogOpen(true)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = renameValue.trim()
    if (!trimmed) return
    renameFolder({ name: trimmed, id })
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    archiveFolder({ id })
  }

  const handleDeleteConfirm = () => {
    deleteFolder(
      { id },
      {
        onSuccess: () => {
          closeDeleteDialog()
        },
      }
    )
  }

  return (
    <>
      <div
        onClick={handleFolderClick}
        className={cn(
          optimistic && 'opacity-60',
          isBusy && 'pointer-events-none opacity-70',
          'group relative flex min-w-[250px] cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/30 hover:shadow-lg'
        )}
      >
        {!optimistic && (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-70 transition-opacity duration-200 hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
                disabled={isBusy}
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

        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="flex flex-col gap-1">
            {onRename ? (
              <Input
                onBlur={updateFolderName}
                autoFocus
                placeholder={name}
                className="h-8 border-none bg-transparent p-0 text-base text-foreground outline-none"
                ref={inputRef}
                defaultValue={displayName}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    updateFolderName()
                  }
                  if (e.key === 'Escape') {
                    setOnRename(false)
                  }
                }}
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
      </div>

      {renameDialogOpen && (
        <Dialog
          open={renameDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeRenameDialog()
            else setRenameDialogOpen(true)
          }}
        >
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRenameSubmit}>
              <DialogHeader>
                <DialogTitle>Rename Folder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
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
                  onClick={closeRenameDialog}
                  disabled={isRenaming}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-clipflow"
                  disabled={!renameValue.trim() || isRenaming}
                >
                  {isRenaming ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {deleteDialogOpen && (
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog()
            else setDeleteDialogOpen(true)
          }}
        >
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete folder?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{displayName}&quot; and all
                videos inside it. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default Folder

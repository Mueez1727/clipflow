import { useRef } from 'react'

export const useRenameFolders = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const folderCardRef = useRef<HTMLDivElement | null>(null)

  return {
    inputRef,
    folderCardRef,
  }
}
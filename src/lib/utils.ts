import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateString = (string: string, slice?: number) => {
  return string.slice(0, slice || 30) + '...'
}

export const toDate = (value: Date | string) =>
  typeof value === 'string' ? new Date(value) : value

export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / 1024 ** i
  return `${value >= 10 || i === 0 ? value.toFixed(i === 0 ? 0 : 1) : value.toFixed(2)} ${units[i]}`
}

/** Always includes seconds, e.g. 2m 34s, 1h 18m 42s, 15s */
export const formatDurationWithSeconds = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export const formatRelativeTime = (date: Date | string | null | undefined) => {
  if (!date) return 'No activity yet'
  const target = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - target.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
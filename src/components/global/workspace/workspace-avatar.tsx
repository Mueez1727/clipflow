import { cn } from '@/lib/utils'
import React from 'react'

const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
]

const pickGradient = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

type Props = {
  name: string
  className?: string
}

const WorkspaceAvatar = ({ name, className }: Props) => {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br font-bold uppercase text-white shadow-sm',
        pickGradient(name || '?'),
        className
      )}
    >
      {(name || '?').charAt(0)}
    </span>
  )
}

export default WorkspaceAvatar

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import React from 'react'

type Props = {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  iconColor: string
}

const StatCard = ({ title, value, icon: Icon, gradient, iconColor }: Props) => {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        gradient
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-transform duration-300 group-hover:scale-150" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl bg-background/60 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110',
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default StatCard

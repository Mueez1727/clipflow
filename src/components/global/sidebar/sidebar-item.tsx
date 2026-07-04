import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {
  icon: React.ReactNode
  title: string
  href: string
  selected: boolean
  notifications?: number
}

const SidebarItem = ({ href, icon, selected, title, notifications }: Props) => {
  return (
    <li className="my-1 cursor-pointer">
      <Link
        href={href}
        className={cn(
          'group relative flex items-center justify-between rounded-lg px-2 py-2 transition-all duration-200',
          selected
            ? 'bg-accent/70 text-[#7C3AED]'
            : 'text-muted-foreground hover:translate-x-0.5 hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#7C3AED] transition-all duration-200',
            selected ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center transition-colors duration-200',
              '[&_svg]:h-[18px] [&_svg]:w-[18px]',
              selected
                ? 'text-[#7C3AED]'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {icon}
          </span>
          <span className="w-32 truncate font-medium transition-colors">
            {title}
          </span>
        </div>
        {notifications && notifications > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C3AED] px-1.5 text-xs font-semibold text-white">
            {notifications}
          </span>
        ) : null}
      </Link>
    </li>
  )
}

export default React.memo(SidebarItem)

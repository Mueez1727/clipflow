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

const SidebarItem = ({ href, icon, selected, title }: Props) => {
  return (
    <li className="cursor-pointer my-[5px]">
      <Link
        href={href}
        className={cn(
          'flex items-center justify-between group rounded-lg transition-all duration-200 hover:bg-accent/80',
          selected ? 'bg-accent/80' : ''
        )}
      >
        <div className="flex items-center gap-2 transition-all p-[5px] cursor-pointer">
          {icon}
          <span
            className={cn(
              'font-medium transition-all truncate w-32',
              selected
                ? 'text-[#7C3AED]'
                : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {title}
          </span>
        </div>
        {}
      </Link>
    </li>
  )
}

export default SidebarItem
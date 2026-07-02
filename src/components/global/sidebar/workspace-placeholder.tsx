import React from 'react'

type Props = { children: React.ReactNode }

const WorkspacePlaceholder = ({ children }: Props) => {
  return (
    <span className="flex h-7 w-8 items-center justify-center rounded-sm bg-muted px-2 font-bold text-[#7C3AED]">
      {children}
    </span>
  )
}

export default WorkspacePlaceholder
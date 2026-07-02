import VideoRecorderIcon from '@/components/icons/video-recorder'
import { ThemeToggle } from '@/components/website/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { Search, UploadIcon } from 'lucide-react'
import React from 'react'

const InfoBar = () => {
  return (
    <header className="fixed z-40 flex w-full items-center justify-between gap-4 border-b border-border bg-background/80 p-4 pl-20 backdrop-blur-xl md:pl-[265px]">
      <div className="flex w-full max-w-lg items-center justify-center gap-4 rounded-full border border-border bg-card px-4 shadow-sm transition-colors">
        <Search size={20} className="shrink-0 text-muted-foreground" />
        <Input
          className="border-none bg-transparent placeholder:text-muted-foreground"
          placeholder="Search for people, projects, tags & folders"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button className="btn-clipflow hidden gap-2 sm:flex">
          <UploadIcon size={18} />
          <span>Upload</span>
        </Button>
        <Button className="btn-clipflow-outline hidden gap-2 sm:flex">
          <VideoRecorderIcon />
          <span>Record</span>
        </Button>
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}

export default InfoBar

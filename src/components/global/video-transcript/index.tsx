import { TabsContent } from '@/components/ui/tabs'
import React from 'react'

type Props = {
  transcript: string
}

const VideoTranscript = ({ transcript }: Props) => {
  return (
    <TabsContent
      value="Transcript"
      className="rounded-xl flex flex-col gap-y-6 "
    >
      <p className="text-muted-foreground">{transcript}</p>
    </TabsContent>
  )
}

export default VideoTranscript
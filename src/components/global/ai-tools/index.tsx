import { Button } from '@/components/ui/button'

import { TabsContent } from '@/components/ui/tabs'

import React from 'react'

import Loader from '../loader'

import {

  Bot,

  FileTextIcon,

  Pencil,

  StarsIcon,

} from 'lucide-react'



type Props = {

  plan: 'PRO' | 'FREE'

  trial: boolean

  videoId: string

}



const AiTools = ({}: Props) => {

  return (

    <TabsContent value="Ai tools">

      <div className="dashboard-surface flex flex-col gap-y-6 p-5">

        <div className="flex items-center gap-4">

          <div className="w-full">

            <h2 className="text-3xl font-bold">Ai Tools</h2>

            <p className="text-muted-foreground">

              Taking your video to the next step with the power of AI!

            </p>

          </div>



          <div className="flex w-full justify-end gap-4">

            <Button className="btn-clipflow mt-2 text-sm">

              <Loader state={false} color="#fff">

                Try now

              </Loader>

            </Button>

            <Button className="btn-clipflow-outline mt-2 text-sm" variant="secondary">

              <Loader state={false} color="currentColor">

                Pay Now

              </Loader>

            </Button>

          </div>

        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 p-4">

          <div className="flex items-center gap-2">

            <h2 className="text-2xl font-bold text-[#7C3AED]">ClipFlow AI</h2>

            <StarsIcon className="text-[#7C3AED]" fill="#7C3AED" />

          </div>

          <div className="flex items-start gap-2">

            <div className="rounded-full border-2 border-border bg-muted p-2">

              <Pencil className="text-[#7C3AED]" />

            </div>

            <div className="flex flex-col">

              <h3 className="text-md">Summary</h3>

              <p className="text-sm text-muted-foreground">

                Generate a description for your video using AI.

              </p>

            </div>

          </div>

          <div className="flex items-start gap-2">

            <div className="rounded-full border-2 border-border bg-muted p-2">

              <FileTextIcon className="text-[#7C3AED]" />

            </div>

            <div className="flex flex-col">

              <h3 className="text-md">Summary</h3>

              <p className="text-sm text-muted-foreground">

                Generate a description for your video using AI.

              </p>

            </div>

          </div>

          <div className="flex items-start gap-2">

            <div className="rounded-full border-2 border-border bg-muted p-2">

              <Bot className="text-[#7C3AED]" />

            </div>

            <div className="flex flex-col">

              <h3 className="text-md">AI Agent</h3>

              <p className="text-sm text-muted-foreground">

                Viewers can ask questions on your video and our ai agent will

                respond.

              </p>

            </div>

          </div>

        </div>

      </div>

    </TabsContent>

  )

}



export default AiTools


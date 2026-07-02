import React from 'react'
import LandingPageNavBar from './_components/navbar'
import { WebsiteFooter } from '@/components/website/footer'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <LandingPageNavBar />
        {children}
      </div>
      <WebsiteFooter />
    </div>
  )
}

export default Layout

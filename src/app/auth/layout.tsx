import Image from 'next/image'
import { CLIPFLOW_LOGO } from '@/components/website/brand-logo'
import { BrandLogo } from '@/components/website/brand-logo'

type Props = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 text-radial" />
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <BrandLogo textClassName="text-3xl" />
        <p className="text-sm text-muted-foreground">
          Sign in to your ClipFlow workspace
        </p>
      </div>
      <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-2xl border border-border bg-card/80 px-2 py-4 shadow-xl backdrop-blur-xl sm:px-4 sm:py-6">
        {children}
      </div>
      <div className="relative z-10 mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Image src={CLIPFLOW_LOGO} alt="" width={24} height={24} className="object-contain" aria-hidden />
        <span>Powered by ClipFlow</span>
      </div>
    </div>
  )
}

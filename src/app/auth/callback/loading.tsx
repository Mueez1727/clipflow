import { Spinner } from '@/components/global/loader/spinner'
import Image from 'next/image'
import { CLIPFLOW_LOGO } from '@/components/website/brand-logo'

const AuthLoading = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <Image src={CLIPFLOW_LOGO} alt="ClipFlow" width={48} height={48} className="object-contain" />
      <p className="text-lg font-semibold clipflow-gradient-text">ClipFlow</p>
      <Spinner />
      <p className="text-sm text-muted-foreground">Loading your workspace...</p>
    </div>
  )
}

export default AuthLoading

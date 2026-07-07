import AuthMarketingLayout from '@/components/global/clerk/auth-marketing-layout'

type Props = {
  children: React.ReactNode
}

export default function AuthEntryLayout({ children }: Props) {
  return <AuthMarketingLayout>{children}</AuthMarketingLayout>
}

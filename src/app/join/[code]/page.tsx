import { onAuthenticateUser } from '@/actions/user'
import { joinWorkspaceByCode } from '@/actions/collab-workspace'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = {
  params: { code: string }
}

const JoinByLinkPage = async ({ params: { code } }: Props) => {
  const auth = await onAuthenticateUser()

  if (auth.status !== 200 && auth.status !== 201) {
    redirect(`/auth/sign-in?redirect_url=/join/${code}`)
  }

  const result = await joinWorkspaceByCode(code)

  if (result.status === 200 && typeof result.data === 'object') {
    redirect(`/dashboard/${result.data.id}/workspace`)
  }

  const fallbackWorkspace = auth.user?.workspace?.[0]?.id
  if (fallbackWorkspace) {
    redirect(`/dashboard/${fallbackWorkspace}?joinError=invalid`)
  }

  redirect('/auth/sign-in')
}

export default JoinByLinkPage

import { onAuthenticateUser } from '@/actions/user'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const AuthCallbackPage = async () => {
  const auth = await onAuthenticateUser()
  console.log(auth)
  if (auth.status === 200 || auth.status === 201) {
    const workspaceId = auth.user?.workspace?.[0]?.id
    if (workspaceId) return redirect(`/dashboard/${workspaceId}`)
    return redirect('/auth/sign-in')
  }

  if (auth.status === 403 || auth.status === 400 || auth.status === 500)
    return redirect('/auth/sign-in')

  return redirect('/auth/sign-in')
}

export default AuthCallbackPage
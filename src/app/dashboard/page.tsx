import { onAuthenticateUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { PERSONAL_ROUTE } from '@/lib/personal-library'

export const dynamic = 'force-dynamic'

const DasboardPage = async () => {
  const auth = await onAuthenticateUser()
  if (auth.status === 200 || auth.status === 201) {
    return redirect(`/dashboard/${PERSONAL_ROUTE}/home`)
  }
  if (auth.status === 400 || auth.status === 500 || auth.status === 404) {
    return redirect('/auth/sign-in')
  }
}

export default DasboardPage

import { SignUp } from '@clerk/nextjs'

const clerkAppearance = {
  variables: {
    colorPrimary: '#7C3AED',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'shadow-none border-0 bg-transparent',
    headerTitle: 'text-foreground',
    headerSubtitle: 'text-muted-foreground',
  },
}

export default function SignUpPage() {
  return <SignUp appearance={clerkAppearance} />
}

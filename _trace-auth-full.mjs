import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const id = 'user_3FTnDH2FKKssSOmTGC7j13M0gfi'
const url = process.env.DATABASE_URL || '(not set)'
const masked = url.replace(/:([^:@]+)@/, ':***@')
const clerkKey = process.env.CLERK_SECRET_KEY
  ? `${process.env.CLERK_SECRET_KEY.slice(0, 12)}...`
  : '(not set)'

console.log('=== Step 1: incoming id ===')
console.log(id)

console.log('\n=== Step 3: DATABASE_URL (masked) ===')
console.log(masked)

console.log('\n=== CLERK_SECRET_KEY (prefix) ===')
console.log(clerkKey)

const prisma = new PrismaClient()

console.log('\n=== Step 2: Prisma query (exact route query) ===')
console.log(
  JSON.stringify(
    {
      model: 'User',
      operation: 'findUnique',
      where: { clerkid: id },
      include: { studio: true, subscription: { select: { plan: true } } },
    },
    null,
    2
  )
)

try {
  const userProfile = await prisma.user.findUnique({
    where: { clerkid: id },
    include: {
      studio: true,
      subscription: { select: { plan: true } },
    },
  })

  console.log('\n=== Step 4: query result (with includes) ===')
  console.log('returns null?', userProfile === null)
  if (userProfile) {
    console.log('user id:', userProfile.id)
    console.log('studio:', userProfile.studio)
    console.log('subscription:', userProfile.subscription)
    console.log('route would return: 200')
  } else {
    console.log('userProfile is null — route falls through to Clerk')
    console.log('\n=== Step 5: Clerk fallback ===')
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(id)
      console.log('Clerk user found:', clerkUser.id, clerkUser.emailAddresses[0]?.emailAddress)
      console.log('route would return: 201 (create user)')
    } catch (clerkErr) {
      console.log('Clerk error status:', clerkErr?.status)
      console.log('Clerk error message:', clerkErr?.message || clerkErr)
      console.log('route would return: 404 Clerk user not found')
    }
  }
} catch (error) {
  console.error('\n=== Query threw (catch block) ===')
  console.error(error)
} finally {
  await prisma.$disconnect()
}

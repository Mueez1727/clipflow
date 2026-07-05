import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const id = 'user_3FTnDH2FKKssSOmTGC7j13M0gfi'
const prisma = new PrismaClient()

const userProfile = await prisma.user.findUnique({
  where: { clerkid: id },
  include: {
    studio: true,
    subscription: { select: { plan: true } },
  },
})

console.log('with includes - null?', userProfile === null)
if (userProfile) {
  console.log({ id: userProfile.id, clerkid: userProfile.clerkid, studio: userProfile.studio, subscription: userProfile.subscription })
}

await prisma.$disconnect()

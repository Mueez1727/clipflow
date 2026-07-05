import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const id = 'user_3FTnDH2FKKssSOmTGC7j13M0gfi'
const url = process.env.DATABASE_URL || '(not set)'
const masked = url.replace(/:([^:@]+)@/, ':***@')

console.log('DATABASE_URL (masked):', masked)

const prisma = new PrismaClient()

try {
  const user = await prisma.user.findUnique({
    where: { clerkid: id },
    select: { id: true, clerkid: true, email: true },
  })
  console.log('findUnique result:', user)

  const allWithSimilar = await prisma.user.findMany({
    where: { clerkid: { contains: '3FTnDH2FKKssSOmTGC7j13M0gfi' } },
    select: { id: true, clerkid: true, email: true },
  })
  console.log('similar clerkids:', allWithSimilar)

  const count = await prisma.user.count()
  console.log('total users in DB:', count)
} catch (e) {
  console.error('Query error:', e.message)
} finally {
  await prisma.$disconnect()
}

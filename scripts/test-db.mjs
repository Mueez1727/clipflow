import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

try {
  await prisma.$connect()
  console.log('DB_CONNECTED')
  const count = await prisma.user.count()
  console.log('USER_COUNT', count)
} catch (error) {
  console.error('DB_ERROR', error.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}

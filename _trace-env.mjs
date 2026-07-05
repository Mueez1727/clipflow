import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

console.log('NEXT_PUBLIC_HOST_URL:', process.env.NEXT_PUBLIC_HOST_URL || '(not set)')
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || '(not set)')
console.log('NODE_ENV:', process.env.NODE_ENV || '(not set)')
console.log('CLERK_SECRET_KEY set:', Boolean(process.env.CLERK_SECRET_KEY))
console.log('DATABASE_URL set:', Boolean(process.env.DATABASE_URL))

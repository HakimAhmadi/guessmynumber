// app/api/test-connection/route.jsx
import { AppDataSource } from '@/lib/typeorm.config'

export async function GET() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepo = AppDataSource.getRepository('User')
  const users = await userRepo.find()

  return Response.json(users)
}

export async function POST(req) {
  const body = await req.json()

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const userRepo = AppDataSource.getRepository('User')
  const user = userRepo.create({ name: body.name, email: body.email })
  await userRepo.save(user)

  return Response.json(user)
}

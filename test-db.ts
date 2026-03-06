import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Checking DB...");
  const accounts = await prisma.socialAccount.findMany({ select: { id: true, platform: true, status: true, username: true } })
  const posts = await prisma.post.findMany({ select: { id: true, status: true, platformIds: true, scheduledFor: true, content: true } })
  console.log("Accounts:", accounts)
  console.log("Posts:", posts)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

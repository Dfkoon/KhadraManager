import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('khadra2026', 10)
  const headSupervisorPassword = await bcrypt.hash('maysoun2026', 10)
  const clerkPassword = await bcrypt.hash('clerk2026', 10)

  // 1. Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'المدير الرئيسي',
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // 2. Head Supervisor (Maysoun)
  await prisma.user.upsert({
    where: { username: 'maysoun.head' },
    update: {},
    create: {
      name: 'ميسون أم آدم',
      username: 'maysoun.head',
      password: headSupervisorPassword,
      role: 'HEAD_SUPERVISOR',
    },
  })

  // 3. Clerks (Zaid, Qusai, Abd, Mohamad)
  const clerks = [
    { name: 'زيد أبو كريم', username: 'zaid.clerk' },
    { name: 'عبد الوالي', username: 'abd.clerk' },
    { name: 'قصي', username: 'qusai.clerk' },
    { name: 'محمد حسين', username: 'mohammad.clerk' },
  ]

  for (const clerk of clerks) {
    await prisma.user.upsert({
      where: { username: clerk.username },
      update: {},
      create: {
        name: clerk.name,
        username: clerk.username,
        password: clerkPassword,
        role: 'CLERK',
      },
    })
  }

  // 4. Products
  const products = [
    { name: 'بندورة', price: 15 },
    { name: 'خيار', price: 10 },
    { name: 'فلفل', price: 10 },
  ]

  for (const prod of products) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } })
    if (!existing) {
      await prisma.product.create({ data: prod })
    }
  }

  // 5. Workers (Piece and Hourly)
  const pieceWorkers = ['أحمد (بكسة)', 'يزيد العمري', 'فريال الحربي', 'سوسن القحطاني']
  for (const name of pieceWorkers) {
    const existing = await prisma.worker.findFirst({ where: { name } })
    if (!existing) {
      await prisma.worker.create({
        data: { name, workerType: 'PIECE' }
      })
    }
  }

  const hourlyWorkers = [
    { name: 'سامر (مياومة)', rate: 150 }, // 1.5 JD/hour
    { name: 'خالد (ساعة)', rate: 200 } // 2 JD/hour
  ]
  for (const w of hourlyWorkers) {
    const existing = await prisma.worker.findFirst({ where: { name: w.name } })
    if (!existing) {
      await prisma.worker.create({
        data: { name: w.name, workerType: 'HOURLY', hourlyRate: w.rate }
      })
    }
  }

  console.log('Database seeded with Head Supervisor, Clerks, and Hourly Workers successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@motive8creative.com' },
    update: {},
    create: {
      name: 'Studio Admin',
      email: 'admin@motive8creative.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Demo member user
  const memberHash = await bcrypt.hash('member123', 12)
  await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      name: 'Jane Doe',
      email: 'member@example.com',
      passwordHash: memberHash,
      phone: '555-0100',
      role: 'MEMBER',
    },
  })

  // Demo regular user
  const userHash = await bcrypt.hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'John Smith',
      email: 'user@example.com',
      passwordHash: userHash,
      phone: '555-0101',
      role: 'USER',
    },
  })

  // Membership plans
  const starterPlan = await prisma.membershipPlan.upsert({
    where: { id: 'plan-starter' },
    update: {},
    create: {
      id: 'plan-starter',
      name: 'Starter',
      description: 'Perfect for occasional creators',
      monthlyFee: 299,
      hoursIncluded: 6,
      discountedHourlyRate: 40,
      regularHourlyRate: 65,
      color: '#8e17b5',
      sortOrder: 1,
    },
  })

  const proPlan = await prisma.membershipPlan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Pro Creator',
      description: 'Our most popular plan for regular creators',
      monthlyFee: 500,
      hoursIncluded: 10,
      discountedHourlyRate: 35,
      regularHourlyRate: 65,
      color: '#c441f5',
      sortOrder: 2,
    },
  })

  await prisma.membershipPlan.upsert({
    where: { id: 'plan-elite' },
    update: {},
    create: {
      id: 'plan-elite',
      name: 'Elite',
      description: 'Maximum access for power users',
      monthlyFee: 800,
      hoursIncluded: 20,
      discountedHourlyRate: 28,
      regularHourlyRate: 65,
      color: '#f59e0b',
      sortOrder: 3,
    },
  })

  // Studio spaces
  await prisma.studioSpace.upsert({
    where: { id: 'space-main' },
    update: {},
    create: {
      id: 'space-main',
      name: 'Main Studio',
      description: 'Our flagship creative space featuring professional lighting, backdrops, and full production capabilities. Perfect for photography, video shoots, and creative projects.',
      capacity: 20,
      amenities: JSON.stringify(['Professional Lighting', 'Multiple Backdrops', 'Green Screen', 'Changing Room', 'WiFi', 'Climate Control', 'Sound System']),
      regularHourlyRate: 65,
      color: '#c441f5',
      sortOrder: 1,
    },
  })

  await prisma.studioSpace.upsert({
    where: { id: 'space-podcast' },
    update: {},
    create: {
      id: 'space-podcast',
      name: 'Podcast Suite',
      description: 'Acoustically treated recording suite with professional microphones, mixer, and streaming equipment. Ideal for podcasts, voiceovers, and audio production.',
      capacity: 6,
      amenities: JSON.stringify(['Soundproofing', 'Professional Microphones', 'Audio Interface', 'Mixing Board', 'Streaming Setup', 'WiFi', 'Lounge Seating']),
      regularHourlyRate: 45,
      color: '#8e17b5',
      sortOrder: 2,
    },
  })

  await prisma.studioSpace.upsert({
    where: { id: 'space-event' },
    update: {},
    create: {
      id: 'space-event',
      name: 'Event Hall',
      description: 'Versatile open floor plan perfect for workshops, pop-up events, product launches, and private gatherings. Flexible layout with full A/V support.',
      capacity: 80,
      amenities: JSON.stringify(['Projector & Screen', 'PA System', 'Flexible Layout', 'Catering Area', 'WiFi', 'Climate Control', 'Parking']),
      regularHourlyRate: 120,
      color: '#f59e0b',
      sortOrder: 3,
    },
  })

  // Studio hours (Mon-Fri 8am-10pm, Sat-Sun 10am-8pm)
  const defaultHours = [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '20:00', isOpen: true },  // Sunday
    { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isOpen: true },  // Monday
    { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isOpen: true },  // Tuesday
    { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isOpen: true },  // Wednesday
    { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isOpen: true },  // Thursday
    { dayOfWeek: 5, openTime: '08:00', closeTime: '22:00', isOpen: true },  // Friday
    { dayOfWeek: 6, openTime: '10:00', closeTime: '20:00', isOpen: true },  // Saturday
  ]

  for (const hours of defaultHours) {
    const existing = await prisma.studioHours.findFirst({ where: { dayOfWeek: hours.dayOfWeek } })
    if (!existing) {
      await prisma.studioHours.create({ data: hours })
    }
  }

  // Site settings
  const settings = await prisma.siteSettings.findFirst()
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        siteName: 'Motive 8 Creative',
        tagline: 'Your Creative Space Awaits',
        contactEmail: 'info@motive8creative.com',
        minBookingHours: 1,
        maxBookingHours: 8,
        advanceBookingDays: 60,
        cancellationHours: 24,
      },
    })
  }

  console.log('✅ Database seeded successfully')
  console.log('Admin: admin@motive8creative.com / admin123')
  console.log('Member: member@example.com / member123')
  console.log('User: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { addMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only seed if database is empty
  const existing = await prisma.user.findFirst()
  if (existing) {
    return NextResponse.json({ message: 'Already seeded', skipped: true })
  }

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      name: 'Studio Admin',
      email: 'admin@motive8creative.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  // Demo regular user
  const userHash = await bcrypt.hash('user123', 12)
  await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'user@example.com',
      passwordHash: userHash,
      phone: '555-0101',
      role: 'USER',
    },
  })

  // Membership plans
  await prisma.membershipPlan.createMany({
    data: [
      {
        id: 'plan-basic',
        name: 'Basic Access',
        description: 'Get in the door with monthly hours and 24/7 after-hours access.',
        monthlyFee: 149,
        hoursIncluded: 3,
        discountedHourlyRate: 55,
        regularHourlyRate: 65,
        color: '#8e17b5',
        sortOrder: 1,
      },
      {
        id: 'plan-studio',
        name: 'Studio Pass',
        description: 'Our most popular plan for regular creators who need consistent studio time.',
        monthlyFee: 299,
        hoursIncluded: 8,
        discountedHourlyRate: 50,
        regularHourlyRate: 65,
        color: '#c441f5',
        sortOrder: 2,
      },
      {
        id: 'plan-pro',
        name: 'Pro Member',
        description: 'Maximum access for power users who live in the studio.',
        monthlyFee: 499,
        hoursIncluded: 18,
        discountedHourlyRate: 45,
        regularHourlyRate: 65,
        color: '#f59e0b',
        sortOrder: 3,
      },
    ],
  })

  // Studio spaces
  await prisma.studioSpace.createMany({
    data: [
      {
        id: 'space-photo',
        name: 'Photo Studio',
        description: 'Professional photo studio featuring top-tier lighting, multiple backdrops, and a green screen — everything you need for a flawless shoot.',
        capacity: 8,
        amenities: JSON.stringify(['Professional Lighting', 'Multiple Backdrops', 'Green Screen', 'Changing Room', 'WiFi', 'Climate Control']),
        regularHourlyRate: 60,
        color: '#c441f5',
        sortOrder: 1,
      },
      {
        id: 'space-whole',
        name: 'Whole Studio',
        description: 'The full Motive 8 Creative experience — open floor plan with PA system, projector, catering area, and parking for events, workshops, and productions.',
        capacity: 40,
        amenities: JSON.stringify(['Everything in Photo Studio', 'Open Floor Plan', 'PA System', 'Projector & Screen', 'Catering Area', 'Parking', 'WiFi', 'Climate Control']),
        regularHourlyRate: 150,
        color: '#f59e0b',
        sortOrder: 2,
      },
    ],
  })

  // Studio hours — Mon (1) through Sun (0), all 07:00–19:00
  await prisma.studioHours.createMany({
    data: [
      { dayOfWeek: 0, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 1, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 2, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 3, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 4, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 5, openTime: '07:00', closeTime: '19:00', isOpen: true },
      { dayOfWeek: 6, openTime: '07:00', closeTime: '19:00', isOpen: true },
    ],
  })

  // Site settings
  await prisma.siteSettings.create({
    data: {
      siteName: 'Motive 8 Creative',
      tagline: 'Motive 8 Yourself',
      contactEmail: 'info@motive8creative.com',
      phone: '210-326-2722',
      address: '11503 Jones Malzberger, San Antonio, TX 78216',
      minBookingHours: 1,
      maxBookingHours: 8,
      advanceBookingDays: 60,
      cancellationHours: 24,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Database seeded successfully',
    accounts: {
      admin: 'admin@motive8creative.com / admin123',
      user: 'user@example.com / user123',
    },
  })
}

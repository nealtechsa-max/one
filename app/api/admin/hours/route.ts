import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const hours = await prisma.studioHours.findMany({ orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json({ hours })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { hours } = body

  for (const h of hours) {
    const existing = await prisma.studioHours.findFirst({ where: { dayOfWeek: h.dayOfWeek } })
    if (existing) {
      await prisma.studioHours.update({
        where: { id: existing.id },
        data: { openTime: h.openTime, closeTime: h.closeTime, isOpen: h.isOpen },
      })
    } else {
      await prisma.studioHours.create({ data: h })
    }
  }

  return NextResponse.json({ success: true })
}

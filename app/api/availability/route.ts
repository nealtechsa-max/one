import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')

  if (!spaceId) {
    return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  }

  const start = new Date()
  const end = addDays(start, 90)

  const bookings = await prisma.booking.findMany({
    where: {
      spaceId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      startTime: { gte: start },
      endTime: { lte: end },
    },
    include: { user: { select: { name: true } }, space: { select: { color: true, name: true } } },
  })

  const space = await prisma.studioSpace.findUnique({ where: { id: spaceId } })

  const events = bookings.map(b => ({
    id: b.id,
    title: b.title || `${b.space.name} – Booked`,
    start: b.startTime.toISOString(),
    end: b.endTime.toISOString(),
    backgroundColor: b.status === 'CONFIRMED' ? (space?.color || '#c441f5') : '#f59e0b',
    borderColor: 'transparent',
    extendedProps: {
      userId: b.userId,
      spaceId: b.spaceId,
      status: b.status,
    },
  }))

  return NextResponse.json({ events })
}

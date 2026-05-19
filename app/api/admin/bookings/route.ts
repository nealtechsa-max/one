import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const spaceId = searchParams.get('spaceId')

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(spaceId ? { spaceId } : {}),
    },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      space: { select: { name: true, color: true } },
    },
    orderBy: { startTime: 'desc' },
    take: 200,
  })

  // Revenue stats
  const stats = await prisma.booking.aggregate({
    where: { status: { not: 'CANCELLED' }, paymentStatus: 'PAID' },
    _sum: { totalPrice: true },
    _count: { id: true },
  })

  return NextResponse.json({ bookings, stats })
}

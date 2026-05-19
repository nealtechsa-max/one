import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { differenceInMinutes } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = (session.user as any).role === 'ADMIN'
    ? (searchParams.get('userId') || undefined)
    : (session.user as any).id

  const bookings = await prisma.booking.findMany({
    where: userId ? { userId } : {},
    include: {
      user: { select: { name: true, email: true } },
      space: { select: { name: true, color: true } },
    },
    orderBy: { startTime: 'desc' },
    take: 100,
  })

  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { spaceId, startTime, endTime, notes, paymentMethod, paymentId } = body

  if (!spaceId || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  const hours = differenceInMinutes(end, start) / 60

  // Check for conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      spaceId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      OR: [
        { startTime: { lt: end }, endTime: { gt: start } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 })
  }

  const space = await prisma.studioSpace.findUnique({ where: { id: spaceId } })
  if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 })

  // Get membership
  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: { plan: true },
  })

  let price = hours * space.regularHourlyRate
  let isMemberBooking = false
  let memberHoursUsed = 0
  let paymentStatus = paymentMethod === 'MEMBER_CREDIT' ? 'PAID' : 'UNPAID'
  let paidPaymentMethod = paymentMethod

  if (membership?.status === 'ACTIVE') {
    isMemberBooking = true
    const remaining = membership.plan.hoursIncluded - membership.hoursUsedThisMonth
    memberHoursUsed = Math.min(hours, Math.max(0, remaining))
    const overageHours = Math.max(0, hours - memberHoursUsed)
    price = overageHours * membership.plan.discountedHourlyRate

    if (paymentId) paymentStatus = 'PAID'
    if (price === 0) paymentStatus = 'PAID'
  } else if (paymentId) {
    paymentStatus = 'PAID'
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      spaceId,
      startTime: start,
      endTime: end,
      totalPrice: price,
      hoursCharged: hours,
      isMemberBooking,
      paymentMethod: paidPaymentMethod || null,
      paymentId: paymentId || null,
      paymentStatus,
      status: paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING',
      notes: notes || null,
    },
  })

  // Update member hours
  if (isMemberBooking && memberHoursUsed > 0 && membership) {
    await prisma.membership.update({
      where: { userId },
      data: {
        hoursUsedThisMonth: { increment: memberHoursUsed },
        totalHoursBooked: { increment: hours },
      },
    })
  }

  // Create invoice
  if (price > 0) {
    await prisma.invoice.create({
      data: {
        userId,
        bookingId: booking.id,
        amount: price,
        status: paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        paymentMethod: paidPaymentMethod || null,
        paymentId: paymentId || null,
        description: `Studio booking – ${space.name} – ${start.toLocaleDateString()}`,
        paidAt: paymentStatus === 'PAID' ? new Date() : null,
      },
    })
  }

  return NextResponse.json({ booking }, { status: 201 })
}

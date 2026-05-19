import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMonths } from 'date-fns'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { planId, paymentMethod, paymentId } = body

  const existing = await prisma.membership.findUnique({ where: { userId } })
  if (existing && existing.status === 'ACTIVE') {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 })
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const membership = existing
    ? await prisma.membership.update({
        where: { userId },
        data: {
          planId,
          status: 'ACTIVE',
          nextBillingDate: addMonths(new Date(), 1),
          hoursUsedThisMonth: 0,
          paymentMethod,
        },
        include: { plan: true },
      })
    : await prisma.membership.create({
        data: {
          userId,
          planId,
          nextBillingDate: addMonths(new Date(), 1),
          paymentMethod,
        },
        include: { plan: true },
      })

  // Update user role
  await prisma.user.update({ where: { id: userId }, data: { role: 'MEMBER' } })

  // Create invoice for first payment
  await prisma.invoice.create({
    data: {
      userId,
      amount: plan.monthlyFee,
      status: 'PAID',
      paymentMethod,
      paymentId,
      description: `${plan.name} Membership – First Month`,
      paidAt: new Date(),
    },
  })

  return NextResponse.json({ membership }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const membership = await prisma.membership.findUnique({
    where: { userId },
    include: { plan: true },
  })

  return NextResponse.json({ membership })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const role = (session.user as any).role

  // Admin can update any membership, users can only pause/cancel their own
  const whereClause = role === 'ADMIN' && body.userId ? { userId: body.userId } : { userId }

  const membership = await prisma.membership.update({
    where: whereClause,
    data: {
      status: body.status,
      planId: body.planId,
      hoursUsedThisMonth: body.hoursUsedThisMonth,
      notes: body.notes,
    },
    include: { plan: true },
  })

  return NextResponse.json({ membership })
}

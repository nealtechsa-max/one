import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const plan = await prisma.membershipPlan.create({ data: body })
  return NextResponse.json({ plan }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...data } = body
  const plan = await prisma.membershipPlan.update({ where: { id }, data })
  return NextResponse.json({ plan })
}

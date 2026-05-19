import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role
  const body = await req.json()

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only owner or admin can update
  if (booking.userId !== userId && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: body.status,
      internalNotes: body.internalNotes,
      notes: body.notes,
    },
  })

  return NextResponse.json({ booking: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const role = (session.user as any).role

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (booking.userId !== userId && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.booking.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  })

  return NextResponse.json({ success: true })
}

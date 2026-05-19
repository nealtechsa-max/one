import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const body = await req.json()
  const { name, phone, currentPassword, newPassword } = body

  const updates: any = {}
  if (name) updates.name = name
  if (phone !== undefined) updates.phone = phone

  if (newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 })
    updates.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, name: true, email: true, phone: true, role: true },
  })

  return NextResponse.json({ user })
}

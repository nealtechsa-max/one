import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, password, phone } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, phone: phone || null },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}

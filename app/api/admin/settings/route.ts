import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await prisma.siteSettings.findFirst()
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const existing = await prisma.siteSettings.findFirst()

  let settings
  if (existing) {
    settings = await prisma.siteSettings.update({ where: { id: existing.id }, data: body })
  } else {
    settings = await prisma.siteSettings.create({ data: body })
  }

  return NextResponse.json({ settings })
}

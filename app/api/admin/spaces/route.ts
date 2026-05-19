import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const spaces = await prisma.studioSpace.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ spaces })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const space = await prisma.studioSpace.create({
    data: { ...body, amenities: JSON.stringify(body.amenities || []) },
  })
  return NextResponse.json({ space }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { id, ...data } = body
  const space = await prisma.studioSpace.update({
    where: { id },
    data: { ...data, amenities: JSON.stringify(data.amenities || []) },
  })
  return NextResponse.json({ space })
}

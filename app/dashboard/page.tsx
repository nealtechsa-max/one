import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import UserDashboardClient from './client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/dashboard')

  const userId = (session.user as any).id

  const [user, bookings, membership] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: { space: { select: { name: true, color: true } } },
      orderBy: { startTime: 'desc' },
      take: 20,
    }),
    prisma.membership.findUnique({
      where: { userId },
      include: { plan: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <UserDashboardClient user={JSON.parse(JSON.stringify(user))} bookings={JSON.parse(JSON.stringify(bookings))} membership={JSON.parse(JSON.stringify(membership))} />
      <Footer />
    </div>
  )
}

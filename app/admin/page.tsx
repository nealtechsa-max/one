import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
import { Calendar, Users, DollarSign, Clock, ChevronRight, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    activeMembers,
    totalBookings,
    confirmedThisMonth,
    revenueThisMonth,
    recentBookings,
    upcomingBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.membership.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.booking.count({ where: { status: 'CONFIRMED', startTime: { gte: startOfMonth } } }),
    prisma.invoice.aggregate({
      where: { status: 'PAID', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, space: { select: { name: true, color: true } } },
    }),
    prisma.booking.findMany({
      where: { startTime: { gte: now }, status: 'CONFIRMED' },
      take: 6,
      orderBy: { startTime: 'asc' },
      include: { user: { select: { name: true } }, space: { select: { name: true, color: true } } },
    }),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'blue', link: '/admin/members' },
    { label: 'Active Members', value: activeMembers.toString(), icon: Users, color: 'brand', link: '/admin/members' },
    { label: 'Bookings This Month', value: confirmedThisMonth.toString(), icon: Calendar, color: 'green', link: '/admin/bookings' },
    { label: 'Revenue This Month', value: formatCurrency(revenueThisMonth._sum.amount || 0), icon: DollarSign, color: 'gold', link: '/admin/bookings' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to the Motive 8 Creative admin panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.link} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                s.color === 'brand' ? 'bg-brand-100 text-brand-600' :
                s.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                s.color === 'green' ? 'bg-green-100 text-green-600' :
                'bg-gold-100 text-gold-600'
              }`}>
                <s.icon className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <div className="font-display font-bold text-2xl text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.space.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">{b.user.name}</span>
                    <span className={`badge text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="text-xs text-gray-400">{b.space.name} · {formatDateTime(b.startTime)}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900 shrink-0">{formatCurrency(b.totalPrice)}</div>
              </div>
            ))}
            {recentBookings.length === 0 && <p className="text-sm text-gray-400">No bookings yet</p>}
          </div>
        </div>

        {/* Upcoming */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link href="/admin/bookings" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.space.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{b.user.name}</div>
                  <div className="text-xs text-gray-400">{b.space.name} · {formatDateTime(b.startTime)}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900 shrink-0">{formatCurrency(b.totalPrice)}</div>
              </div>
            ))}
            {upcomingBookings.length === 0 && <p className="text-sm text-gray-400">No upcoming bookings</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, CreditCard, User, Star, ChevronRight, X, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalPrice: number
  hoursCharged: number
  paymentStatus: string
  paymentMethod: string | null
  notes: string | null
  space: { name: string; color: string }
}

interface Membership {
  id: string
  status: string
  startDate: string
  nextBillingDate: string
  hoursUsedThisMonth: number
  plan: {
    name: string
    monthlyFee: number
    hoursIncluded: number
    discountedHourlyRate: number
    color: string
  }
}

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
}

export default function UserDashboardClient({
  user,
  bookings,
  membership,
}: {
  user: User | null
  bookings: Booking[]
  membership: Membership | null
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [tab, setTab] = useState<'bookings' | 'membership' | 'profile'>('bookings')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [localBookings, setLocalBookings] = useState(bookings)

  const handleCancelMembership = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your membership? You will retain access until the end of your current billing period.'
    )
    if (!confirmed) return
    try {
      const res = await fetch('/api/members', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel membership')
      toast('Membership cancelled successfully', 'success')
      router.push('/membership')
    } catch {
      toast('Could not cancel membership. Please try again.', 'error')
    }
  }

  const upcomingBookings = localBookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'CANCELLED')
  const pastBookings = localBookings.filter(b => new Date(b.startTime) <= new Date() || b.status === 'CANCELLED')

  const handleCancel = async (id: string) => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel')
      setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
      toast('Booking cancelled', 'success')
      setCancelId(null)
    } catch {
      toast('Could not cancel booking', 'error')
    } finally {
      setCancelling(false)
    }
  }

  const hoursRemaining = membership
    ? Math.max(0, membership.plan.hoursIncluded - membership.hoursUsedThisMonth)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
        </div>
        <Link href="/book" className="btn-primary text-sm">
          <Calendar className="w-4 h-4" /> Book a Space
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Upcoming" value={upcomingBookings.length.toString()} icon={<Calendar className="w-5 h-5" />} color="brand" />
        <StatCard label="Total Bookings" value={localBookings.filter(b => b.status !== 'CANCELLED').length.toString()} icon={<Clock className="w-5 h-5" />} color="blue" />
        <StatCard
          label="Member Status"
          value={membership?.status === 'ACTIVE' ? membership.plan.name : 'No Plan'}
          icon={<Star className="w-5 h-5" />}
          color={membership?.status === 'ACTIVE' ? 'gold' : 'gray'}
        />
        {membership?.status === 'ACTIVE' && (
          <StatCard label="Hours Left" value={`${hoursRemaining.toFixed(1)}h`} icon={<Clock className="w-5 h-5" />} color="green" />
        )}
      </div>

      {/* Membership alert */}
      {membership?.status === 'ACTIVE' && (
        <div className="card mb-6" style={{ borderLeft: `4px solid ${membership.plan.color}` }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{membership.plan.name} Member</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {hoursRemaining.toFixed(1)} of {membership.plan.hoursIncluded} hours remaining this month
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Renews</div>
              <div className="font-medium text-gray-900">{formatDate(membership.nextBillingDate)}</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (membership.hoursUsedThisMonth / membership.plan.hoursIncluded) * 100)}%`,
                  backgroundColor: membership.plan.color,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{membership.hoursUsedThisMonth.toFixed(1)}h used</span>
              <span>{membership.plan.hoursIncluded}h total</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(['bookings', 'membership', 'profile'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="space-y-6">
          {upcomingBookings.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming Bookings</h3>
              <div className="space-y-3">
                {upcomingBookings.map(b => (
                  <BookingCard key={b.id} booking={b} onCancel={() => setCancelId(b.id)} />
                ))}
              </div>
            </div>
          )}
          {pastBookings.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Past Bookings</h3>
              <div className="space-y-3">
                {pastBookings.map(b => (
                  <BookingCard key={b.id} booking={b} past />
                ))}
              </div>
            </div>
          )}
          {localBookings.length === 0 && (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
              <Link href="/book" className="btn-primary mt-4 text-sm">Book Your First Session</Link>
            </div>
          )}
        </div>
      )}

      {/* Membership Tab */}
      {tab === 'membership' && (
        <div>
          {membership?.status === 'ACTIVE' ? (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold" style={{ color: membership.plan.color }}>{membership.plan.name}</span>
                  <h2 className="font-bold text-2xl text-gray-900 mt-1">{formatCurrency(membership.plan.monthlyFee)}/mo</h2>
                </div>
                <span className="badge bg-green-100 text-green-800">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InfoBox label="Hours Included" value={`${membership.plan.hoursIncluded} hrs/mo`} />
                <InfoBox label="Hours Used" value={`${membership.hoursUsedThisMonth.toFixed(1)} hrs`} />
                <InfoBox label="Overage Rate" value={formatCurrency(membership.plan.discountedHourlyRate) + '/hr'} />
                <InfoBox label="Next Billing" value={formatDate(membership.nextBillingDate)} />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Member since {formatDate(membership.startDate)}
              </p>
              <div className="flex gap-3">
                <Link href="/membership" className="btn-secondary text-sm">Change Plan</Link>
                <button onClick={handleCancelMembership} className="text-sm text-red-500 hover:text-red-700 px-3 py-2">Cancel Membership</button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">No Active Membership</h3>
              <p className="text-gray-500 text-sm mb-6">Join a membership plan to get included hours and discounted rates.</p>
              <Link href="/membership" className="btn-primary">View Membership Plans</Link>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && user && (
        <ProfileForm user={user} />
      )}

      {/* Cancel confirm */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg">Cancel Booking?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">This will cancel your booking. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="btn-secondary flex-1 text-sm">Keep It</button>
              <button onClick={() => handleCancel(cancelId)} disabled={cancelling} className="flex-1 rounded-xl bg-red-600 text-white text-sm font-semibold py-3 hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, onCancel, past }: { booking: Booking; onCancel?: () => void; past?: boolean }) {
  return (
    <div className={`card flex items-start gap-4 ${past ? 'opacity-70' : ''}`}>
      <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: booking.space.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-gray-900 text-sm">{booking.space.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{formatDateTime(booking.startTime)} – {new Date(booking.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
          </div>
          <div className="text-right shrink-0">
            <span className={`badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
            <div className="text-xs text-gray-500 mt-1">{formatCurrency(booking.totalPrice)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{booking.hoursCharged}h</span>
          <span className={`text-xs ${getStatusColor(booking.paymentStatus)} badge`}>{booking.paymentStatus}</span>
          {!past && booking.status === 'CONFIRMED' && onCancel && (
            <button onClick={onCancel} className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    gold: 'bg-gold-50 text-gold-600',
    gray: 'bg-gray-100 text-gray-500',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="card">
      <div className={`w-9 h-9 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="font-bold text-xl text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-gray-900 mt-0.5">{value}</div>
    </div>
  )
}

function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      toast('Profile updated!', 'success')
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="card max-w-lg space-y-4">
      <h3 className="font-semibold text-lg text-gray-900">Edit Profile</h3>
      <div>
        <label className="label">Full Name</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" value={user.email} disabled className="input bg-gray-50 cursor-not-allowed" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
      </div>
      <hr className="border-gray-100" />
      <h4 className="font-semibold text-gray-700 text-sm">Change Password</h4>
      <div>
        <label className="label">Current Password</label>
        <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} className="input" />
      </div>
      <div>
        <label className="label">New Password</label>
        <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} className="input" />
      </div>
      <button type="submit" disabled={saving} className="btn-primary text-sm">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
      </button>
    </form>
  )
}

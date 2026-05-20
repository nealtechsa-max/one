'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
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
  isMemberBooking: boolean
  notes: string | null
  internalNotes: string | null
  createdAt: string
  user: { name: string; email: string; phone: string | null }
  space: { name: string; color: string }
}

interface Stats {
  _sum: { totalPrice: number | null }
  _count: { id: number }
}

const STATUSES = ['', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED']

export default function AdminBookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editNotes, setEditNotes] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/bookings?${params}`)
      const data = await res.json()
      setBookings(data.bookings || [])
      setStats(data.stats)
    } catch {
      toast('Failed to load bookings', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, internalNotes: editNotes }),
    })
    if (res.ok) {
      toast('Booking updated', 'success')
      setSelectedBooking(null)
      load()
    } else {
      toast('Update failed', 'error')
    }
  }

  const filtered = bookings.filter(b =>
    !search ||
    b.user.name.toLowerCase().includes(search.toLowerCase()) ||
    b.user.email.toLowerCase().includes(search.toLowerCase()) ||
    b.space.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {stats ? `${stats._count.id} paid bookings · ${formatCurrency(stats._sum.totalPrice || 0)} total revenue` : 'Loading stats...'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or space..."
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Space</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Date & Time</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Hours</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Payment</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No bookings found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-sm text-gray-900">{b.user.name}</div>
                    <div className="text-xs text-gray-400">{b.user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.space.color }} />
                      <span className="text-sm text-gray-700">{b.space.name}</span>
                    </div>
                    {b.isMemberBooking && <span className="badge bg-brand-50 text-brand-700 text-xs mt-1">Member</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(b.startTime)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{b.hoursCharged}h</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${getStatusColor(b.paymentStatus)}`}>{b.paymentStatus}</span>
                    {b.paymentMethod && <div className="text-xs text-gray-400 mt-0.5">{b.paymentMethod}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => { setSelectedBooking(b); setEditNotes(b.internalNotes || '') }}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">Manage Booking</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Customer" value={selectedBooking.user.name} />
                <Info label="Email" value={selectedBooking.user.email} />
                <Info label="Space" value={selectedBooking.space.name} />
                <Info label="Time" value={formatDateTime(selectedBooking.startTime)} />
                <Info label="Hours" value={`${selectedBooking.hoursCharged}h`} />
                <Info label="Total" value={formatCurrency(selectedBooking.totalPrice)} />
                <Info label="Payment" value={selectedBooking.paymentStatus} />
                <Info label="Method" value={selectedBooking.paymentMethod || 'N/A'} />
              </div>
              {selectedBooking.notes && (
                <div className="rounded-xl bg-gray-50 p-3 text-sm">
                  <strong className="text-gray-600">Customer notes:</strong> {selectedBooking.notes}
                </div>
              )}
              <div>
                <label className="label">Internal Notes</label>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="input min-h-[70px] resize-none text-sm" placeholder="Internal notes..." />
              </div>
              <div>
                <label className="label">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedBooking.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                        selectedBooking.status === s
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-2.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-900 mt-0.5">{value}</div>
    </div>
  )
}

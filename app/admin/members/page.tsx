'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Star, Users } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
  bookings: { id: string }[]
  membership: {
    id: string
    status: string
    hoursUsedThisMonth: number
    nextBillingDate: string
    plan: { name: string; monthlyFee: number; hoursIncluded: number; color: string }
  } | null
}

interface Plan {
  id: string
  name: string
  monthlyFee: number
  hoursIncluded: number
}

export default function AdminMembersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'members' | 'users'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editPlanId, setEditPlanId] = useState('')
  const [editHours, setEditHours] = useState(0)
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [usersRes, plansRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/plans'),
      ])
      const usersData = await usersRes.json()
      const plansData = await plansRes.json()
      setUsers(usersData.users || [])
      setPlans(plansData.plans || [])
    } catch {
      toast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openUser = (user: User) => {
    setSelectedUser(user)
    setEditPlanId(user.membership?.plan ? user.membership.plan.name ? plans.find(p => p.name === user.membership?.plan.name)?.id || '' : '' : '')
    setEditHours(user.membership?.hoursUsedThisMonth || 0)
    setEditStatus(user.membership?.status || 'ACTIVE')
  }

  const saveMembership = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          planId: editPlanId || undefined,
          hoursUsedThisMonth: editHours,
          status: editStatus,
        }),
      })
      if (!res.ok) throw new Error()
      toast('Membership updated', 'success')
      setSelectedUser(null)
      load()
    } catch {
      toast('Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    if (res.ok) {
      toast('Role updated', 'success')
      load()
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'members' && u.membership?.status === 'ACTIVE') || (filter === 'users' && !u.membership?.status)
    return matchSearch && matchFilter
  })

  const memberCount = users.filter(u => u.membership?.status === 'ACTIVE').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Members & Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users · {memberCount} active members</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1"><Users className="w-3.5 h-3.5" /> Total Users</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-brand-600">{memberCount}</div>
          <div className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5" /> Active Members</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-display font-bold text-gold-600">
            {formatCurrency(users.reduce((acc, u) => acc + (u.membership?.status === 'ACTIVE' ? u.membership.plan.monthlyFee : 0), 0))}
          </div>
          <div className="text-sm text-gray-400 mt-1">MRR (membership)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" placeholder="Search users..." />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'members', 'users'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Membership</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Hours Used</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Bookings</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={e => updateUserRole(u.id, e.target.value)}
                      className="text-xs rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="USER">USER</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.membership?.status === 'ACTIVE' ? (
                      <div>
                        <span className="badge" style={{ backgroundColor: u.membership.plan.color + '20', color: u.membership.plan.color }}>
                          {u.membership.plan.name}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">{formatCurrency(u.membership.plan.monthlyFee)}/mo</div>
                      </div>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-500">No Plan</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.membership ? (
                      <div>
                        <span className="text-sm font-medium text-gray-900">{u.membership.hoursUsedThisMonth.toFixed(1)}</span>
                        <span className="text-xs text-gray-400"> / {u.membership.plan.hoursIncluded}h</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{u.bookings.length}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => openUser(u)} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900">Edit User</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedUser.name}</div>
                  <div className="text-sm text-gray-400">{selectedUser.email}</div>
                </div>
              </div>

              {selectedUser.membership && (
                <>
                  <div>
                    <label className="label">Membership Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input">
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Plan</label>
                    <select value={editPlanId} onChange={e => setEditPlanId(e.target.value)} className="input">
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} – {formatCurrency(p.monthlyFee)}/mo ({p.hoursIncluded}h)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Hours Used This Month (Adjust)</label>
                    <input type="number" min={0} step={0.25} value={editHours} onChange={e => setEditHours(Number(e.target.value))} className="input" />
                    <p className="text-xs text-gray-400 mt-1">Included hours: {selectedUser.membership.plan.hoursIncluded}</p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedUser(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={saveMembership} disabled={saving || !selectedUser.membership} className="btn-primary flex-1 text-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              {!selectedUser.membership && (
                <p className="text-xs text-gray-400 text-center">User has no membership to edit</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

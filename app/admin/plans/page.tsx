'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X, Loader2, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Plan {
  id: string
  name: string
  description: string
  monthlyFee: number
  hoursIncluded: number
  discountedHourlyRate: number
  regularHourlyRate: number
  isActive: boolean
  color: string
  sortOrder: number
}

const defaultPlan = {
  name: '',
  description: '',
  monthlyFee: 0,
  hoursIncluded: 0,
  discountedHourlyRate: 0,
  regularHourlyRate: 65,
  isActive: true,
  color: '#c441f5',
  sortOrder: 0,
}

export default function AdminPlansPage() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editPlan, setEditPlan] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/plans')
    const data = await res.json()
    setPlans(data.plans || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditPlan({ ...defaultPlan }); setShowForm(true) }
  const openEdit = (p: Plan) => { setEditPlan({ ...p }); setShowForm(true) }

  const save = async () => {
    setSaving(true)
    try {
      const method = editPlan.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPlan),
      })
      if (!res.ok) throw new Error()
      toast(editPlan.id ? 'Plan updated' : 'Plan created', 'success')
      setShowForm(false)
      load()
    } catch {
      toast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'number' ? Number(e.target.value) : e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setEditPlan((p: any) => ({ ...p, [field]: v }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-500 text-sm mt-1">Manage pricing and included hours for each plan</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Plan</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.id} className={`card ${!p.isActive ? 'opacity-60' : ''}`} style={{ borderTop: `3px solid ${p.color}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" style={{ color: p.color }} />
                    <span className="font-display font-bold text-gray-900">{p.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                </div>
                {!p.isActive && <span className="badge bg-gray-100 text-gray-500 text-xs">Inactive</span>}
              </div>
              <div className="text-3xl font-display font-bold text-gray-900 mb-3">
                {formatCurrency(p.monthlyFee)}<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Included hours</span>
                  <span className="font-medium">{p.hoursIncluded}h/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Regular rate</span>
                  <span className="font-medium">{formatCurrency(p.regularHourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Overage rate</span>
                  <span className="font-medium text-green-600">{formatCurrency(p.discountedHourlyRate)}/hr</span>
                </div>
              </div>
              <button onClick={() => openEdit(p)} className="w-full text-sm text-brand-600 border border-brand-200 rounded-xl py-2 hover:bg-brand-50 transition-colors font-medium">
                Edit Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && editPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900">{editPlan.id ? 'Edit Plan' : 'New Plan'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Plan Name</label>
                <input type="text" value={editPlan.name} onChange={set('name')} className="input" placeholder="e.g. Pro Creator" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={editPlan.description} onChange={set('description')} className="input min-h-[60px] resize-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly Fee ($)</label>
                  <input type="number" min={0} step={1} value={editPlan.monthlyFee} onChange={set('monthlyFee')} className="input" />
                </div>
                <div>
                  <label className="label">Hours Included</label>
                  <input type="number" min={0} step={1} value={editPlan.hoursIncluded} onChange={set('hoursIncluded')} className="input" />
                </div>
                <div>
                  <label className="label">Regular Rate ($/hr)</label>
                  <input type="number" min={0} step={1} value={editPlan.regularHourlyRate} onChange={set('regularHourlyRate')} className="input" />
                </div>
                <div>
                  <label className="label">Overage Rate ($/hr)</label>
                  <input type="number" min={0} step={1} value={editPlan.discountedHourlyRate} onChange={set('discountedHourlyRate')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={editPlan.color} onChange={set('color')} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <span className="text-sm text-gray-500">{editPlan.color}</span>
                </div>
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input type="number" min={0} value={editPlan.sortOrder} onChange={set('sortOrder')} className="input" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editPlan.isActive} onChange={set('isActive')} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary flex-1 text-sm">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X, Building2, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Space {
  id: string
  name: string
  description: string
  capacity: number
  amenities: string
  regularHourlyRate: number
  isActive: boolean
  color: string
  sortOrder: number
}

const defaultSpace = {
  name: '',
  description: '',
  capacity: 10,
  amenities: [] as string[],
  regularHourlyRate: 65,
  isActive: true,
  color: '#c441f5',
  sortOrder: 0,
}

export default function AdminSpacesPage() {
  const { toast } = useToast()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSpace, setEditSpace] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [amenityInput, setAmenityInput] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/spaces')
    const data = await res.json()
    setSpaces(data.spaces || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditSpace({ ...defaultSpace, amenities: [] })
    setShowForm(true)
  }

  const openEdit = (s: Space) => {
    setEditSpace({ ...s, amenities: JSON.parse(s.amenities || '[]') })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const method = editSpace.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/spaces', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSpace),
      })
      if (!res.ok) throw new Error()
      toast(editSpace.id ? 'Space updated' : 'Space created', 'success')
      setShowForm(false)
      load()
    } catch {
      toast('Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addAmenity = () => {
    if (!amenityInput.trim()) return
    setEditSpace((prev: any) => ({ ...prev, amenities: [...prev.amenities, amenityInput.trim()] }))
    setAmenityInput('')
  }

  const removeAmenity = (i: number) => {
    setEditSpace((prev: any) => ({ ...prev, amenities: prev.amenities.filter((_: any, idx: number) => idx !== i) }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Studio Spaces</h1>
          <p className="text-gray-500 text-sm mt-1">{spaces.length} spaces configured</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Space
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {spaces.map(s => {
            const amenities = JSON.parse(s.amenities || '[]') as string[]
            return (
              <div key={s.id} className={`card ${!s.isActive ? 'opacity-60' : ''}`}>
                <div className="h-24 rounded-xl mb-4 flex items-center justify-center text-white text-3xl" style={{ background: `linear-gradient(135deg, ${s.color}dd, ${s.color}88)` }}>
                  <Building2 className="w-8 h-8 opacity-80" />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  {!s.isActive && <span className="badge bg-gray-100 text-gray-500 text-xs">Inactive</span>}
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {amenities.slice(0, 3).map(a => <span key={a} className="badge bg-gray-100 text-gray-600 text-xs">{a}</span>)}
                  {amenities.length > 3 && <span className="badge bg-gray-100 text-gray-500 text-xs">+{amenities.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatCurrency(s.regularHourlyRate)}/hr · {s.capacity} cap</span>
                  <button onClick={() => openEdit(s)} className="text-brand-600 hover:text-brand-700 font-medium">Edit</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && editSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">{editSpace.id ? 'Edit Space' : 'New Space'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Space Name" value={editSpace.name} onChange={v => setEditSpace((p: any) => ({ ...p, name: v }))} />
              <div>
                <label className="label">Description</label>
                <textarea value={editSpace.description} onChange={e => setEditSpace((p: any) => ({ ...p, description: e.target.value }))} className="input min-h-[80px] resize-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacity" value={editSpace.capacity.toString()} onChange={v => setEditSpace((p: any) => ({ ...p, capacity: Number(v) }))} type="number" />
                <Field label="Hourly Rate ($)" value={editSpace.regularHourlyRate.toString()} onChange={v => setEditSpace((p: any) => ({ ...p, regularHourlyRate: Number(v) }))} type="number" />
              </div>
              <div>
                <label className="label">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={editSpace.color} onChange={e => setEditSpace((p: any) => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer" />
                  <span className="text-sm text-gray-500">{editSpace.color}</span>
                </div>
              </div>
              <div>
                <label className="label">Amenities</label>
                <div className="flex gap-2 mb-2">
                  <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} className="input text-sm flex-1" placeholder="e.g. Projector" />
                  <button onClick={addAmenity} className="btn-primary text-sm px-3 py-2">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editSpace.amenities.map((a: string, i: number) => (
                    <span key={i} className="badge bg-brand-50 text-brand-700 gap-1">
                      {a}
                      <button onClick={() => removeAmenity(i)} className="text-brand-400 hover:text-brand-700">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editSpace.isActive} onChange={e => setEditSpace((p: any) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary flex-1 text-sm">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Space'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="input" />
    </div>
  )
}

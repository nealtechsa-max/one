'use client'

import { useState, useEffect } from 'react'
import { Save, Clock, Settings, CreditCard, Mail, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface StudioHours {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
}

interface SiteSettings {
  siteName: string
  tagline: string
  contactEmail: string
  contactPhone: string
  address: string
  minBookingHours: number
  maxBookingHours: number
  advanceBookingDays: number
  cancellationHours: number
  paypalClientId: string
  paypalMode: string
  squareAppId: string
  squareLocationId: string
  squareMode: string
  emailNotifications: boolean
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<'general' | 'hours' | 'payments' | 'email'>('general')
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [hours, setHours] = useState<StudioHours[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sRes, hRes] = await Promise.all([fetch('/api/admin/settings'), fetch('/api/admin/hours')])
        const sData = await sRes.json()
        const hData = await hRes.json()
        setSettings(sData.settings || {})
        setHours(hData.hours || [])
      } catch {
        toast('Failed to load settings', 'error')
      }
    }
    loadData()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      toast('Settings saved!', 'success')
    } catch {
      toast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveHours = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      })
      if (!res.ok) throw new Error()
      toast('Hours saved!', 'success')
    } catch {
      toast('Failed to save hours', 'error')
    } finally {
      setSaving(false)
    }
  }

  const updateHour = (dayOfWeek: number, field: keyof StudioHours, value: any) => {
    setHours(prev => prev.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
  }

  const set = (field: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked :
      e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setSettings(prev => prev ? { ...prev, [field]: value } : prev)
  }

  if (!settings) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your studio, availability, and integrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'hours', label: 'Studio Hours', icon: Clock },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'email', label: 'Email', icon: Mail },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="card max-w-2xl space-y-5">
          <h2 className="font-semibold text-lg text-gray-900">General Settings</h2>
          <InputField label="Studio Name" value={settings.siteName} onChange={set('siteName')} />
          <InputField label="Tagline" value={settings.tagline} onChange={set('tagline')} />
          <InputField label="Contact Email" value={settings.contactEmail} onChange={set('contactEmail')} type="email" />
          <InputField label="Contact Phone" value={settings.contactPhone} onChange={set('contactPhone')} />
          <InputField label="Address" value={settings.address} onChange={set('address')} />
          <hr className="border-gray-100" />
          <h3 className="font-semibold text-gray-700">Booking Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Min Booking Hours" value={settings.minBookingHours.toString()} onChange={set('minBookingHours')} type="number" />
            <InputField label="Max Booking Hours" value={settings.maxBookingHours.toString()} onChange={set('maxBookingHours')} type="number" />
            <InputField label="Advance Booking Days" value={settings.advanceBookingDays.toString()} onChange={set('advanceBookingDays')} type="number" />
            <InputField label="Cancellation Notice (hrs)" value={settings.cancellationHours.toString()} onChange={set('cancellationHours')} type="number" />
          </div>
          <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {/* Hours */}
      {tab === 'hours' && (
        <div className="card max-w-2xl">
          <h2 className="font-semibold text-lg text-gray-900 mb-5">Studio Operating Hours</h2>
          <div className="space-y-3">
            {DAYS.map((day, i) => {
              const h = hours.find(h => h.dayOfWeek === i)
              if (!h) return null
              return (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-24 font-medium text-sm text-gray-700">{day}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => updateHour(i, 'isOpen', !h.isOpen)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${h.isOpen ? 'bg-brand-600' : 'bg-gray-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${h.isOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-gray-500">{h.isOpen ? 'Open' : 'Closed'}</span>
                  </label>
                  {h.isOpen && (
                    <>
                      <input
                        type="time"
                        value={h.openTime}
                        onChange={e => updateHour(i, 'openTime', e.target.value)}
                        className="input w-auto text-sm"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={h.closeTime}
                        onChange={e => updateHour(i, 'closeTime', e.target.value)}
                        className="input w-auto text-sm"
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <button onClick={saveHours} disabled={saving} className="btn-primary text-sm mt-5">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Hours'}
          </button>
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div className="card max-w-2xl space-y-6">
          <h2 className="font-semibold text-lg text-gray-900">Payment Settings</h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-xl">🅿</span> PayPal
            </h3>
            <div>
              <label className="label">Mode</label>
              <select value={settings.paypalMode} onChange={set('paypalMode')} className="input w-auto">
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>
            <InputField label="PayPal Client ID" value={settings.paypalClientId} onChange={set('paypalClientId')} placeholder="AZDxj..." />
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-xl">⬛</span> Square
            </h3>
            <div>
              <label className="label">Mode</label>
              <select value={settings.squareMode} onChange={set('squareMode')} className="input w-auto">
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production</option>
              </select>
            </div>
            <InputField label="Square App ID" value={settings.squareAppId} onChange={set('squareAppId')} placeholder="sandbox-sq0idb..." />
            <InputField label="Square Location ID" value={settings.squareLocationId} onChange={set('squareLocationId')} placeholder="L..." />
          </div>

          <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </div>
      )}

      {/* Email */}
      {tab === 'email' && (
        <div className="card max-w-2xl space-y-5">
          <h2 className="font-semibold text-lg text-gray-900">Email Notifications</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={set('emailNotifications')}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="text-sm font-medium text-gray-700">Enable email notifications for bookings</span>
          </label>
          {settings.emailNotifications && (
            <>
              <InputField label="SMTP Host" value={settings.smtpHost} onChange={set('smtpHost')} placeholder="smtp.gmail.com" />
              <InputField label="SMTP Port" value={settings.smtpPort.toString()} onChange={set('smtpPort')} type="number" />
              <InputField label="SMTP Username" value={settings.smtpUser} onChange={set('smtpUser')} placeholder="your@email.com" />
              <InputField label="SMTP Password" value={settings.smtpPass} onChange={set('smtpPass')} type="password" />
            </>
          )}
          <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Email Settings'}
          </button>
        </div>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={onChange} className="input" placeholder={placeholder} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Registration failed')
      setLoading(false)
      return
    }

    // Auto sign in
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white text-base leading-none">Motive 8</div>
              <div className="font-display font-semibold text-brand-400 text-sm leading-none">Creative</div>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start booking your creative space today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} className="input" placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  className="input pr-10"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} className="input" placeholder="Repeat your password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

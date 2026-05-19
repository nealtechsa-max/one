'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push(callbackUrl)
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
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
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your bookings</p>
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
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="#" className="text-xs text-brand-600 hover:text-brand-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 font-medium hover:text-brand-700">
              Create one
            </Link>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            <strong className="text-gray-700">Demo accounts:</strong><br />
            Admin: admin@motive8creative.com / admin123<br />
            Member: member@example.com / member123<br />
            User: user@example.com / user123
          </div>
        </div>
      </div>
    </div>
  )
}

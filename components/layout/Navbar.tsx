'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Calendar, User, LogOut, Settings, LayoutDashboard, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-800 text-gray-900 text-sm leading-none">Motive 8</span>
              <span className="block font-display font-semibold text-brand-600 text-xs leading-none">Creative</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/#spaces">Spaces</NavLink>
            <NavLink href="/book">Book Now</NavLink>
            <NavLink href="/membership">Membership</NavLink>
            <NavLink href="/#about">About</NavLink>
          </div>

          {/* Auth / CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                    {session.user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.user?.name?.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/book" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                      <Calendar className="w-4 h-4" /> Book Space
                    </Link>
                    {(session.user as any)?.role === 'ADMIN' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link href="/book" className="btn-primary text-sm py-2 px-5">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <MobileNavLink href="/#spaces" onClick={() => setMobileOpen(false)}>Spaces</MobileNavLink>
          <MobileNavLink href="/book" onClick={() => setMobileOpen(false)}>Book Now</MobileNavLink>
          <MobileNavLink href="/membership" onClick={() => setMobileOpen(false)}>Membership</MobileNavLink>
          <MobileNavLink href="/#about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
          <div className="pt-3 border-t border-gray-100">
            {session ? (
              <>
                <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
                {(session.user as any)?.role === 'ADMIN' && (
                  <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileNavLink>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileNavLink>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm py-2 mt-2 block">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
      {children}
    </Link>
  )
}

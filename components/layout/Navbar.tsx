'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ChevronDown, LayoutDashboard, Calendar, Settings, LogOut } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.08)]' : 'border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight">
              Motive<span className="text-brand-600">8</span>
              <span className="font-normal text-gray-500 ml-1">Creative</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/#spaces">Spaces</NavLink>
            <NavLink href="/membership">Pricing</NavLink>
            <NavLink href="/#about">About</NavLink>
            <NavLink href="/book">Book Now</NavLink>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center uppercase">
                    {session.user?.name?.charAt(0)}
                  </div>
                  <span>{session.user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-gray-100 shadow-dropdown py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    <DropdownItem href="/dashboard" icon={<LayoutDashboard className="w-3.5 h-3.5" />} onClick={() => setProfileOpen(false)}>Dashboard</DropdownItem>
                    <DropdownItem href="/book" icon={<Calendar className="w-3.5 h-3.5" />} onClick={() => setProfileOpen(false)}>Book a Space</DropdownItem>
                    {(session.user as any)?.role === 'ADMIN' && (
                      <DropdownItem href="/admin" icon={<Settings className="w-3.5 h-3.5" />} onClick={() => setProfileOpen(false)}>Admin Panel</DropdownItem>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-0.5">
            <MobileNavLink href="/#spaces" onClick={() => setMobileOpen(false)}>Spaces</MobileNavLink>
            <MobileNavLink href="/membership" onClick={() => setMobileOpen(false)}>Pricing</MobileNavLink>
            <MobileNavLink href="/#about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
            <MobileNavLink href="/book" onClick={() => setMobileOpen(false)}>Book Now</MobileNavLink>
            <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
              {session ? (
                <>
                  <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
                  {(session.user as any)?.role === 'ADMIN' && (
                    <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileNavLink>
                  )}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <MobileNavLink href="/login" onClick={() => setMobileOpen(false)}>Log in</MobileNavLink>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center text-sm py-2.5">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
      {children}
    </Link>
  )
}

function DropdownItem({ href, icon, onClick, children }: { href: string; icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-1">
      <span className="text-gray-400">{icon}</span>
      {children}
    </Link>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Calendar, Settings, Sparkles,
  CreditCard, Building2, Clock, LogOut, ChevronRight, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/members', label: 'Members & Users', icon: Users },
  { href: '/admin/spaces', label: 'Studio Spaces', icon: Building2 },
  { href: '/admin/plans', label: 'Membership Plans', icon: Star },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-gray-950 text-gray-300 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-none">Motive 8</div>
            <div className="font-display text-brand-400 text-xs leading-none">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-4 h-4" />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

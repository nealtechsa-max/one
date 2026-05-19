import Link from 'next/link'
import { Sparkles, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-sm leading-none">Motive 8</span>
                <span className="block font-display font-semibold text-brand-400 text-xs leading-none">Creative</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Your premier creative studio space. Professional environments for photographers, videographers, podcasters, and event creators.
            </p>
            <div className="flex gap-3">
              <SocialLink href="#"><Instagram className="w-4 h-4" /></SocialLink>
              <SocialLink href="#"><Facebook className="w-4 h-4" /></SocialLink>
              <SocialLink href="#"><Twitter className="w-4 h-4" /></SocialLink>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/book">Book a Space</FooterLink>
              <FooterLink href="/membership">Membership Plans</FooterLink>
              <FooterLink href="/#spaces">Our Spaces</FooterLink>
              <FooterLink href="/#about">About Us</FooterLink>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/login">Sign In</FooterLink>
              <FooterLink href="/register">Create Account</FooterLink>
              <FooterLink href="/dashboard">My Bookings</FooterLink>
              <FooterLink href="/dashboard">My Membership</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>info@motive8creative.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>(555) 000-0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>123 Creative Blvd<br />Your City, ST 00000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Motive 8 Creative. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-brand-700 flex items-center justify-center transition-colors">
      {children}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-white transition-colors">{children}</Link>
    </li>
  )
}

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Phone, Clock, CheckCircle, ArrowRight, Camera, Building2, Star, Moon } from 'lucide-react'

async function getSpacesAndPlans() {
  const [spaces, plans] = await Promise.all([
    prisma.studioSpace.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  return { spaces, plans }
}

export default async function HomePage() {
  const { spaces, plans } = await getSpacesAndPlans()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3.5 py-1.5 text-brand-700 text-xs font-semibold tracking-wide uppercase mb-5">
                📍 San Antonio, TX
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
                Motive 8<br />
                <span className="text-brand-600">Yourself.</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                San Antonio's creative studio — available by the hour. Professional photo studio and full event space, designed for creators who are serious about their work.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/book" className="btn-primary px-7 py-3 text-[15px]">
                  Book Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/membership" className="btn-secondary px-7 py-3 text-[15px]">
                  Membership Plans
                </Link>
              </div>
              <div className="flex flex-col gap-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                  Open daily 7am – 7pm · Members get 24/7 access
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                  11503 Jones Malzberger, San Antonio, TX 78216
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                  (210) 326-2722
                </div>
              </div>
            </div>

            {/* Right — space preview cards */}
            <div className="hidden lg:grid grid-cols-1 gap-4">
              {spaces.slice(0, 2).map(space => {
                const amenities = JSON.parse(space.amenities || '[]') as string[]
                const Icon = space.name.toLowerCase().includes('photo') ? Camera : Building2
                return (
                  <div key={space.id} className="card-hover flex items-center gap-5 p-5">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${space.color}cc, ${space.color}66)` }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{space.name}</span>
                        <span className="text-brand-600 font-bold text-sm">{formatCurrency(space.regularHourlyRate)}/hr</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{space.description}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {amenities.slice(0, 3).map(a => (
                          <span key={a} className="badge bg-gray-100 text-gray-500 text-[10px]">{a}</span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/book?space=${space.id}`} className="btn-primary text-xs px-3 py-1.5 shrink-0">
                      Book
                    </Link>
                  </div>
                )
              })}
              {/* After-hours card */}
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-900 text-sm">Members get 24/7 access</div>
                  <div className="text-xs text-brand-700 mt-0.5">Book before or after hours — any time, any day.</div>
                </div>
                <Link href="/membership" className="ml-auto text-xs text-brand-700 font-semibold hover:underline shrink-0">
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            <Stat number="2" label="Professional spaces" />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <Stat number="$60" label="Photo studio / hr" />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <Stat number="$150" label="Whole studio / hr" />
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <Stat number="24/7" label="Members-only access" />
          </div>
        </div>
      </div>

      {/* ── How to book ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Book in minutes</h2>
            <p className="text-gray-500 leading-relaxed">No phone calls. Pick your space, choose your time, pay online, and show up ready to create.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Step num="1" icon={<Camera className="w-5 h-5" />} title="Choose your space" desc="Photo Studio for shoots, or the Whole Studio for larger productions and events." />
              <Step num="2" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>} title="Pick your date & time" desc="Check live availability on our calendar and select any open slot that works for you." />
              <Step num="3" icon={<CheckCircle className="w-5 h-5" />} title="Confirm & show up" desc="Pay securely online, get an instant confirmation, and arrive ready to create." />
            </div>
          </div>
        </div>
      </section>

      {/* ── Spaces ───────────────────────────────────────────── */}
      <section id="spaces" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Our spaces</h2>
              <p className="text-gray-500">Both spaces are fully equipped and available by the hour.</p>
            </div>
            <Link href="/book" className="hidden sm:flex btn-ghost text-sm gap-1">
              Check availability <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {spaces.map(space => {
              const amenities = JSON.parse(space.amenities || '[]') as string[]
              const Icon = space.name.toLowerCase().includes('photo') ? Camera : Building2
              return (
                <div key={space.id} className="card-hover flex flex-col">
                  <div
                    className="h-48 rounded-lg mb-5 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${space.color}cc, ${space.color}55)` }}
                  >
                    <Icon className="w-16 h-16 text-white opacity-90" />
                    <div className="absolute bottom-3 right-3 bg-white/25 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-3 py-1">
                      Up to {space.capacity} people
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{space.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{space.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {amenities.map(a => (
                      <span key={a} className="badge bg-gray-100 text-gray-600 text-[11px]">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(space.regularHourlyRate)}</span>
                      <span className="text-sm text-gray-400">/hr</span>
                    </div>
                    <Link href={`/book?space=${space.id}`} className="btn-primary text-sm px-5 py-2.5">
                      Book Now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Membership ───────────────────────────────────────── */}
      <section id="membership" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Become a member</h2>
            <p className="text-gray-500 leading-relaxed">
              Get monthly studio hours, discounted rates, and exclusive <strong>24/7 after-hours access</strong> — book any time, even overnight.
            </p>
          </div>
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700 font-medium">
              <Moon className="w-4 h-4" />
              Members only: Studio access after 7pm and before 7am, 365 days a year
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-7 flex flex-col transition-shadow ${
                  i === 1
                    ? 'border-brand-500 shadow-[0_0_0_1px_rgba(196,65,245,0.4),0_8px_24px_rgba(196,65,245,0.12)]'
                    : 'border-gray-200 shadow-card hover:shadow-card-hover'
                }`}
              >
                {i === 1 && (
                  <span className="self-start bg-brand-600 text-white text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full mb-3">
                    Most popular
                  </span>
                )}
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.monthlyFee)}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <PlanFeature>{plan.hoursIncluded} studio hours/month</PlanFeature>
                  <PlanFeature>{formatCurrency(plan.discountedHourlyRate)}/hr after included hours</PlanFeature>
                  <PlanFeature>24/7 after-hours studio access</PlanFeature>
                  <PlanFeature>Priority booking</PlanFeature>
                  <PlanFeature>Cancel anytime</PlanFeature>
                </ul>
                <Link
                  href={`/membership?plan=${plan.id}`}
                  className={`text-center rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    i === 1 ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Rather pay as you go?{' '}
            <Link href="/book" className="text-brand-600 hover:underline font-medium">
              Book without a membership →
            </Link>
          </p>
        </div>
      </section>

      {/* ── About / CTA ──────────────────────────────────────── */}
      <section id="about" className="py-24 bg-brand-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-5">
              Built for San Antonio creatives
            </h2>
            <p className="text-brand-100 leading-relaxed mb-8 text-lg">
              Motive 8 Creative is San Antonio's go-to creative studio — built for photographers, videographers, content creators, and anyone who needs a professional space to bring their vision to life. Walk in with an idea. Walk out with a masterpiece.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">2</div>
                <div className="text-xs text-brand-200">Pro Spaces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs text-brand-200">Member Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">San Antonio</div>
                <div className="text-xs text-brand-200">Texas</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/book" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 text-[15px]">
                Book a Space <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:2103262722" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 text-[15px]">
                <Phone className="w-4 h-4" /> (210) 326-2722
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900 tracking-tight">{number}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function Step({ num, icon, title, desc }: { num: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center flex flex-col items-center">
      <div className="w-[52px] h-[52px] rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-5 relative z-10">
        {icon}
      </div>
      <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Step {num}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{desc}</p>
    </div>
  )
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-600">
      <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
      {children}
    </li>
  )
}

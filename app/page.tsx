import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Camera, Mic, PartyPopper, Star } from 'lucide-react'

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
      <section className="bg-white pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <p className="text-brand-600 font-semibold text-sm tracking-wide uppercase mb-4">
                Studio Booking Platform
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-6">
                Book professional creative space — instantly.
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
                Photography studios, podcast suites, and event halls. Pick a time, pay online, and show up ready to create.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/book" className="btn-primary px-6 py-3 text-[15px]">
                  Book a space <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register" className="btn-secondary px-6 py-3 text-[15px]">
                  Create free account
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <TrustPill icon={<Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />} text="4.9 average rating" />
                <TrustPill icon={<Users className="w-3.5 h-3.5 text-brand-500" />} text="200+ active members" />
                <TrustPill icon={<Clock className="w-3.5 h-3.5 text-brand-500" />} text="Instant confirmation" />
              </div>
            </div>

            {/* Right — decorative booking card mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-purple-50 rounded-3xl -rotate-2" />
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-card-hover p-6 space-y-4">
                {/* Mini calendar header */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Main Studio</span>
                  <span className="badge bg-green-50 text-green-700 font-medium">Available</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {[...Array(6)].map((_,i) => <div key={i} />)}
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => (
                    <div key={d} className={`rounded-full w-7 h-7 mx-auto flex items-center justify-center text-xs cursor-pointer
                      ${d === 18 ? 'bg-brand-600 text-white font-semibold' : ''}
                      ${[14,15,22].includes(d) ? 'bg-brand-100 text-brand-700' : ''}
                      ${![18,14,15,22].includes(d) ? 'text-gray-700 hover:bg-gray-100' : ''}
                    `}>{d}</div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {[['10:00 AM', '11:00 AM'], ['2:00 PM', '4:00 PM']].map(([start, end]) => (
                    <div key={start} className="flex items-center gap-3 p-2.5 rounded-lg bg-brand-50 border border-brand-100">
                      <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      <span className="text-sm text-brand-800 font-medium">{start} – {end}</span>
                    </div>
                  ))}
                </div>
                <Link href="/book" className="btn-primary w-full justify-center text-sm">
                  Reserve this time
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ───────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            <Stat number="1,500+" label="Sessions hosted" />
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <Stat number="200+" label="Happy members" />
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <Stat number="3" label="Professional spaces" />
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <Stat number="4.9 ★" label="Average rating" />
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Book in minutes, not hours</h2>
            <p className="text-gray-500 leading-relaxed">No phone tags. No back-and-forth. Just pick a time and you're done.</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Step
                num="1"
                icon={<Calendar className="w-5 h-5" />}
                title="Pick your space & time"
                desc="Browse available spaces and select the perfect slot on our live calendar."
              />
              <Step
                num="2"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                title="Confirm & pay"
                desc="Secure checkout via PayPal. Members can apply their included hours instantly."
              />
              <Step
                num="3"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                title="Show up & create"
                desc="Get an instant confirmation email with everything you need. We'll be ready when you arrive."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Spaces ───────────────────────────────────────────── */}
      <section id="spaces" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Our creative spaces</h2>
              <p className="text-gray-500">Professional environments, fully equipped and ready to book.</p>
            </div>
            <Link href="/book" className="hidden sm:flex btn-ghost text-sm gap-1">
              View availability <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const amenities = JSON.parse(space.amenities || '[]') as string[]
              const icons = { 'Main Studio': Camera, 'Podcast Suite': Mic, 'Event Hall': PartyPopper }
              const Icon = icons[space.name as keyof typeof icons] || Camera
              return (
                <div key={space.id} className="card-hover flex flex-col">
                  {/* Space color band */}
                  <div
                    className="h-40 rounded-lg mb-5 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${space.color}cc, ${space.color}66)` }}
                  >
                    <Icon className="w-14 h-14 text-white opacity-90" />
                    <div className="absolute bottom-2.5 right-2.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-2.5 py-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Up to {space.capacity}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{space.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{space.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {amenities.slice(0, 4).map((a) => (
                      <span key={a} className="badge bg-gray-100 text-gray-600 text-[11px]">{a}</span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="badge bg-gray-100 text-gray-500 text-[11px]">+{amenities.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(space.regularHourlyRate)}</span>
                      <span className="text-sm text-gray-400">/hr</span>
                    </div>
                    <Link href={`/book?space=${space.id}`} className="btn-primary text-sm px-4 py-2">
                      Book
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Membership / Pricing ─────────────────────────────── */}
      <section id="membership" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 leading-relaxed">
              Join as a member and lock in monthly hours at a discounted rate — or book pay-as-you-go any time.
            </p>
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
                  <div className="inline-flex self-start mb-3">
                    <span className="bg-brand-600 text-white text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}
                <div className="mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: plan.color }}>
                    {plan.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.monthlyFee)}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  <PlanFeature>{plan.hoursIncluded} studio hours included</PlanFeature>
                  <PlanFeature>Only {formatCurrency(plan.discountedHourlyRate)}/hr after included hours</PlanFeature>
                  <PlanFeature>Priority booking access</PlanFeature>
                  <PlanFeature>Monthly auto-billing</PlanFeature>
                  <PlanFeature>Cancel any time</PlanFeature>
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
            Prefer pay-as-you-go?{' '}
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
              Built for creators, by creators
            </h2>
            <p className="text-brand-100 leading-relaxed mb-10 text-lg">
              Motive 8 Creative gives talented people access to professional-grade spaces without the overhead. Photographers, podcasters, videographers, and event planners — we have your space ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/book" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 text-[15px]">
                Book a space <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center text-[15px]">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900 tracking-tight">{number}</div>
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
      <h3 className="font-semibold text-gray-900 mb-2 text-[15px]">{title}</h3>
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

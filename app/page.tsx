import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Clock, Users, Star, Zap, Shield, ChevronRight, CheckCircle, Camera, Mic, PartyPopper } from 'lucide-react'

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
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-700/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-300 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Professional Creative Studios
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-900 leading-tight mb-6">
              Your Vision.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-gold-400">Our Space.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-xl">
              Book professional creative spaces by the hour. Photography studios, podcast suites, and event halls — all designed to elevate your work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="btn-gold text-base px-8 py-4 shadow-lg shadow-gold-500/20">
                Book a Space <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/membership" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                View Memberships
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-12">
              <Stat number="500+" label="Bookings Made" />
              <div className="w-px h-10 bg-white/10" />
              <Stat number="3" label="Creative Spaces" />
              <div className="w-px h-10 bg-white/10" />
              <Stat number="4.9★" label="Average Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Simple & Fast"
            title="Book in 3 easy steps"
            subtitle="From browsing to booking in minutes. No phone calls, no back-and-forth."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Step number="01" icon={<Calendar className="w-6 h-6" />} title="Pick Your Space & Time" description="Choose from our professional spaces and select your preferred date and time on our live calendar." />
            <Step number="02" icon={<Shield className="w-6 h-6" />} title="Confirm & Pay" description="Pay securely with PayPal or Square. Members can use their included hours with one click." />
            <Step number="03" icon={<Star className="w-6 h-6" />} title="Create & Enjoy" description="Show up and create. We'll send a confirmation with everything you need to know." />
          </div>
        </div>
      </section>

      {/* Spaces */}
      <section id="spaces" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our Spaces"
            title="Choose your creative environment"
            subtitle="Each space is fully equipped, professionally maintained, and ready for your best work."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {spaces.map((space) => {
              const amenities = JSON.parse(space.amenities || '[]') as string[]
              const icons = { 'Main Studio': Camera, 'Podcast Suite': Mic, 'Event Hall': PartyPopper }
              const Icon = icons[space.name as keyof typeof icons] || Camera
              return (
                <div key={space.id} className="card hover:shadow-md transition-shadow group">
                  <div className="h-48 rounded-xl mb-5 flex items-center justify-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${space.color}dd, ${space.color}88)` }}>
                    <Icon className="w-16 h-16 opacity-80" />
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-semibold">
                      Up to {space.capacity} people
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{space.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{space.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {amenities.slice(0, 4).map((a) => (
                      <span key={a} className="badge bg-brand-50 text-brand-700">{a}</span>
                    ))}
                    {amenities.length > 4 && <span className="badge bg-gray-100 text-gray-600">+{amenities.length - 4} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-display font-bold text-gray-900">{formatCurrency(space.regularHourlyRate)}</span>
                      <span className="text-gray-400 text-sm">/hour</span>
                    </div>
                    <Link href={`/book?space=${space.id}`} className="btn-primary text-sm py-2 px-4">
                      Book Now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Save More"
            title="Become a member"
            subtitle="Lock in a monthly rate, get included hours, and enjoy discounted rates on additional time."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {plans.map((plan, i) => (
              <div key={plan.id} className={`card relative ${i === 1 ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-500/10' : ''}`}>
                {i === 1 && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-5">
                  <span className="text-sm font-semibold" style={{ color: plan.color }}>{plan.name}</span>
                  <div className="mt-2">
                    <span className="text-4xl font-display font-bold text-gray-900">{formatCurrency(plan.monthlyFee)}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <PlanFeature>{plan.hoursIncluded} hours/month included</PlanFeature>
                  <PlanFeature>{formatCurrency(plan.regularHourlyRate)}/hr regular rate</PlanFeature>
                  <PlanFeature>Only {formatCurrency(plan.discountedHourlyRate)}/hr after included hours</PlanFeature>
                  <PlanFeature>Priority booking access</PlanFeature>
                  <PlanFeature>Auto monthly billing</PlanFeature>
                </ul>
                <Link href={`/membership?plan=${plan.id}`} className={`block text-center rounded-xl py-3 font-semibold text-sm transition-all ${i === 1 ? 'btn-primary' : 'btn-secondary'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            All memberships auto-renew monthly. Cancel anytime. Hours reset each billing cycle.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gradient-to-br from-brand-950 to-gray-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-300 text-sm font-medium mb-6">
              About Us
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">Built for creators, by creators</h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              Motive 8 Creative was founded with one mission: give talented creators access to professional-grade spaces without the overhead of a full-time studio. Whether you're a solo photographer, a growing podcast network, or planning your next big event — we're here to help you make it happen.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-brand-400 mb-1">3+</div>
                <div className="text-sm text-gray-400">Years Open</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-brand-400 mb-1">200+</div>
                <div className="text-sm text-gray-400">Happy Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-brand-400 mb-1">1,500+</div>
                <div className="text-sm text-gray-400">Sessions Hosted</div>
              </div>
            </div>
            <Link href="/book" className="btn-gold">
              Book Your First Session <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-display font-bold text-white">{number}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="text-sm font-semibold text-brand-600 uppercase tracking-wide">{eyebrow}</span>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">{title}</h2>
      <p className="text-gray-500 leading-relaxed">{subtitle}</p>
    </div>
  )
}

function Step({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex mb-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600">{icon}</div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">{number.slice(1)}</span>
      </div>
      <h3 className="font-display font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      {children}
    </li>
  )
}

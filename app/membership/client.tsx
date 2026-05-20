'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Star, Zap, ChevronRight, X, Loader2 } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Plan {
  id: string
  name: string
  description: string
  monthlyFee: number
  hoursIncluded: number
  discountedHourlyRate: number
  regularHourlyRate: number
  color: string
}

export default function MembershipClient({ plans }: { plans: Plan[] }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelect = (plan: Plan) => {
    if (!session) {
      router.push(`/login?callbackUrl=/membership?plan=${plan.id}`)
      return
    }
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const activateMembership = async (paymentMethod: string, paymentId: string) => {
    if (!selectedPlan) return
    setLoading(true)
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id, paymentMethod, paymentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast(`Welcome to the ${selectedPlan.name} membership!`, 'success')
      setShowModal(false)
      router.push('/dashboard')
    } catch (err: any) {
      toast(err.message || 'Membership activation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-brand-700 text-sm font-medium mb-4">
            <Star className="w-3.5 h-3.5" /> Membership Plans
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 mb-4">Book more, pay less.</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Motive 8 members get monthly studio hours, discounted rates, and exclusive 24/7 after-hours access.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`card relative flex flex-col ${i === 1 ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-500/10' : ''}`}
            >
              {i === 1 && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1 rounded-full"
                  style={{ backgroundColor: plan.color }}
                >
                  MOST POPULAR
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: plan.color + '20' }}>
                    <Zap className="w-4 h-4" style={{ color: plan.color }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: plan.color }}>{plan.name}</span>
                </div>
                <div className="mt-3">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.monthlyFee)}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                <Feature color={plan.color}><strong>{plan.hoursIncluded} studio hours</strong> per month included</Feature>
                <Feature color={plan.color}>Regular rate: {formatCurrency(plan.regularHourlyRate)}/hr</Feature>
                <Feature color={plan.color}>Overage rate: only <strong>{formatCurrency(plan.discountedHourlyRate)}/hr</strong></Feature>
                <Feature color={plan.color}>Priority calendar access</Feature>
                <Feature color={plan.color}>Flexible space selection</Feature>
                <Feature color={plan.color}>Auto monthly billing</Feature>
                <Feature color={plan.color}>Cancel anytime</Feature>
                <Feature color={plan.color}><strong>24/7 After-Hours Access</strong></Feature>
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                className="rounded-xl py-3 font-semibold text-sm transition-all text-white"
                style={{ backgroundColor: plan.color }}
              >
                Get Started with {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-bold text-2xl text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQ q="When do my hours reset?" a="Hours reset at the start of each billing cycle (monthly). Unused hours do not carry over. Hours are for the Photo Studio at $60/hr base rate." />
            <FAQ q="What happens after I use all my included hours?" a="You'll continue to have full access at your plan's discounted overage rate — much lower than the standard $60/hr rate. Basic Access members pay $55/hr, Studio Pass members pay $50/hr, and Pro Members pay $45/hr." />
            <FAQ q="Do I get after-hours access?" a="Yes! All members get 24/7 access to the studio — including evenings, nights, and weekends beyond our regular 7am–7pm hours." />
            <FAQ q="Can I change my plan?" a="Yes! You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect on your next billing date." />
            <FAQ q="How does billing work?" a="You're billed automatically on the same date each month via PayPal or Square. You'll receive an email receipt." />
            <FAQ q="Can I cancel?" a="Yes, you can cancel your membership at any time from your dashboard. Access continues until the end of your current billing period." />
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-xl text-gray-900">{selectedPlan.name} Membership</h2>
                <p className="text-sm text-gray-500 mt-0.5">First payment: <strong>{formatCurrency(selectedPlan.monthlyFee)}</strong></p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-xl bg-gray-50 p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-medium">{selectedPlan.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Included hours</span><span className="font-medium">{selectedPlan.hoursIncluded}/month</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Overage rate</span><span className="font-medium">{formatCurrency(selectedPlan.discountedHourlyRate)}/hr</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold"><span>First payment</span><span style={{ color: selectedPlan.color }}>{formatCurrency(selectedPlan.monthlyFee)}</span></div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Activating membership...
                </div>
              ) : (
                <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4fYMObodsiCkB4fh9X1', currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', shape: 'rect', color: 'blue' }}
                    createOrder={(_, actions) => actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [{
                        amount: { value: selectedPlan.monthlyFee.toFixed(2), currency_code: 'USD' },
                        description: `Motive 8 Creative – ${selectedPlan.name} Membership`,
                      }],
                    })}
                    onApprove={async (data, actions) => {
                      const order = await actions.order?.capture()
                      await activateMembership('PAYPAL', order?.id || data.orderID)
                    }}
                    onError={() => toast('PayPal error. Please try again.', 'error')}
                  />
                </PayPalScriptProvider>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Feature({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600">
      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
      {children}
    </li>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
    </div>
  )
}

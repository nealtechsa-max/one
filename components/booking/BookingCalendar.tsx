'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, parseISO, setHours, setMinutes } from 'date-fns'
import { Clock, Users, CheckCircle, X, CreditCard, Calendar } from 'lucide-react'
import { formatCurrency, formatDateTime, formatTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import PaymentModal from '@/components/booking/PaymentModal'

interface Space {
  id: string
  name: string
  description: string
  capacity: number
  amenities: string
  regularHourlyRate: number
  color: string
}

interface StudioHours {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isOpen: boolean
}

interface SiteSettings {
  minBookingHours: number
  maxBookingHours: number
  advanceBookingDays: number
  cancellationHours: number
}

interface BookingCalendarProps {
  spaces: Space[]
  studioHours: StudioHours[]
  settings: SiteSettings | null
}

interface BookingEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: { userId: string; spaceId: string; status: string }
}

interface NewBooking {
  spaceId: string
  startTime: Date
  endTime: Date
  hours: number
  price: number
  isMemberBooking: boolean
}

export default function BookingCalendar({ spaces, studioHours, settings }: BookingCalendarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const calendarRef = useRef<any>(null)

  const defaultSpaceId = searchParams.get('space') || spaces[0]?.id || ''
  const [selectedSpace, setSelectedSpace] = useState(defaultSpaceId)
  const [events, setEvents] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [newBooking, setNewBooking] = useState<NewBooking | null>(null)
  const [notes, setNotes] = useState('')
  const [view, setView] = useState<'timeGridWeek' | 'timeGridDay' | 'dayGridMonth'>('timeGridWeek')

  const space = spaces.find(s => s.id === selectedSpace)
  const membership = (session?.user as any)?.membership

  const loadEvents = useCallback(async () => {
    if (!selectedSpace) return
    setLoading(true)
    try {
      const res = await fetch(`/api/availability?spaceId=${selectedSpace}`)
      const data = await res.json()
      setEvents(data.events || [])
    } catch {
      toast('Failed to load availability', 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedSpace, toast])

  useEffect(() => { loadEvents() }, [loadEvents])

  const getBusinessHours = () => {
    return studioHours
      .filter(h => h.isOpen)
      .map(h => ({
        daysOfWeek: [h.dayOfWeek],
        startTime: h.openTime,
        endTime: h.closeTime,
      }))
  }

  const handleSelect = (selectInfo: any) => {
    if (!session) {
      router.push('/login?callbackUrl=/book')
      return
    }
    if (!space) return

    const start = new Date(selectInfo.startStr)
    const end = new Date(selectInfo.endStr)
    const hours = Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 4) / 4

    if (hours < (settings?.minBookingHours || 1)) {
      toast(`Minimum booking is ${settings?.minBookingHours || 1} hour(s)`, 'error')
      return
    }
    if (hours > (settings?.maxBookingHours || 8)) {
      toast(`Maximum booking is ${settings?.maxBookingHours || 8} hours`, 'error')
      return
    }

    // Check if member has hours available
    const isMemberBooking = membership?.status === 'ACTIVE' &&
      membership.hoursUsedThisMonth < membership.plan.hoursIncluded

    let price: number
    if (isMemberBooking) {
      const remainingHours = membership.plan.hoursIncluded - membership.hoursUsedThisMonth
      const memberHoursUsed = Math.min(hours, remainingHours)
      const overageHours = Math.max(0, hours - remainingHours)
      price = (overageHours * membership.plan.discountedHourlyRate)
    } else if (membership?.status === 'ACTIVE') {
      price = hours * membership.plan.discountedHourlyRate
    } else {
      price = hours * space.regularHourlyRate
    }

    setNewBooking({ spaceId: selectedSpace, startTime: start, endTime: end, hours, price, isMemberBooking })
    setShowBookingModal(true)
  }

  const handleBookingConfirm = () => {
    if (!newBooking) return
    if (newBooking.price === 0) {
      // Free booking via member hours — submit directly
      submitBooking('MEMBER_CREDIT', '')
    } else {
      setShowBookingModal(false)
      setShowPaymentModal(true)
    }
  }

  const submitBooking = async (paymentMethod: string, paymentId: string) => {
    if (!newBooking) return
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: newBooking.spaceId,
          startTime: newBooking.startTime.toISOString(),
          endTime: newBooking.endTime.toISOString(),
          notes,
          paymentMethod,
          paymentId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast('Booking confirmed!', 'success')
      setShowBookingModal(false)
      setShowPaymentModal(false)
      setNewBooking(null)
      setNotes('')
      loadEvents()
    } catch (err: any) {
      toast(err.message || 'Booking failed', 'error')
    }
  }

  const isMember = membership?.status === 'ACTIVE'
  const dayHours = studioHours.find(h => h.isOpen)
  const minTime = isMember ? '00:00' : (dayHours?.openTime || '07:00')
  const maxTime = isMember ? '24:00' : (dayHours?.closeTime || '19:00')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-5">
        {/* Space selector */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Select Space</h3>
          <div className="space-y-2">
            {spaces.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSpace(s.id)}
                className={`w-full text-left rounded-xl p-3 border-2 transition-all ${
                  selectedSpace === s.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{formatCurrency(s.regularHourlyRate)}/hr · {s.capacity} people</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Space details */}
        {space && (
          <div className="card">
            <div className="w-full h-28 rounded-xl mb-4 flex items-center justify-center text-white text-4xl" style={{ background: `linear-gradient(135deg, ${space.color}dd, ${space.color}88)` }}>
              🎬
            </div>
            <h3 className="font-semibold text-gray-900">{space.name}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{space.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {space.capacity} max</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatCurrency(space.regularHourlyRate)}/hr</span>
            </div>
            {membership?.status === 'ACTIVE' && (
              <div className="mt-3 rounded-lg bg-brand-50 border border-brand-100 p-3 text-xs">
                <div className="font-semibold text-brand-700">Member Pricing Active</div>
                <div className="text-brand-600 mt-0.5">
                  {membership.plan.hoursIncluded - membership.hoursUsedThisMonth > 0
                    ? `${(membership.plan.hoursIncluded - membership.hoursUsedThisMonth).toFixed(1)} hrs included remaining`
                    : `${formatCurrency(membership.plan.discountedHourlyRate)}/hr discounted rate`
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {/* After-hours member notice */}
        {!isMember && session && (
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-700">
            <div className="font-semibold mb-0.5">Want after-hours access?</div>
            <div className="text-brand-600 mb-2">Members can book 24/7 — any time, any day.</div>
            <a href="/membership" className="font-semibold underline">View plans →</a>
          </div>
        )}

        {/* Hours */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Studio Hours</h3>
          <div className="space-y-1.5">
            {studioHours.map(h => (
              <div key={h.dayOfWeek} className="flex justify-between text-xs">
                <span className="text-gray-500">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][h.dayOfWeek]}</span>
                <span className={h.isOpen ? 'text-gray-700 font-medium' : 'text-gray-300'}>
                  {h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'}
                </span>
              </div>
            ))}
            {isMember && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-brand-600 font-medium flex items-center gap-1">
                ✦ Member: 24/7 access unlocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="lg:col-span-3">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
              <span className="text-sm font-medium text-gray-700">Available</span>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-gray-700">Booked</span>
            </div>
            <p className="text-xs text-gray-400">Click & drag to select time</p>
          </div>
          {loading && (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading availability...
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            selectable={true}
            selectMirror={true}
            selectMinDistance={1}
            select={handleSelect}
            businessHours={getBusinessHours()}
            height="auto"
            slotMinTime={minTime}
            slotMaxTime={maxTime}
            slotDuration="00:30:00"
            expandRows={true}
            nowIndicator={true}
            validRange={{
              start: new Date().toISOString().split('T')[0],
              end: addDays(new Date(), settings?.advanceBookingDays || 60).toISOString().split('T')[0],
            }}
            eventColor={space?.color || '#c441f5'}
          />
        </div>
      </div>

      {/* Booking summary modal */}
      {showBookingModal && newBooking && space && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">Confirm Booking</h2>
              <button onClick={() => setShowBookingModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Space" value={space.name} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={format(newBooking.startTime, 'EEEE, MMM d, yyyy')} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Time" value={`${formatTime(newBooking.startTime)} – ${formatTime(newBooking.endTime)}`} />
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Duration" value={`${newBooking.hours} hour${newBooking.hours !== 1 ? 's' : ''}`} />
                {newBooking.isMemberBooking && membership && (
                  <div className="rounded-lg bg-brand-50 border border-brand-100 p-2.5 text-xs text-brand-700">
                    <strong>Member hours applied.</strong> {Math.min(newBooking.hours, membership.plan.hoursIncluded - membership.hoursUsedThisMonth).toFixed(1)} hrs from your plan.
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-600 text-white p-4">
                <span className="font-semibold">Total</span>
                <span className="font-display font-bold text-2xl">{formatCurrency(newBooking.price)}</span>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="input min-h-[80px] resize-none text-sm"
                  placeholder="Any special requests or setup notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowBookingModal(false)} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button onClick={handleBookingConfirm} className="btn-primary flex-1 text-sm">
                {newBooking.price === 0 ? (
                  <><CheckCircle className="w-4 h-4" /> Confirm (Free)</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay {formatCurrency(newBooking.price)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPaymentModal && newBooking && (
        <PaymentModal
          amount={newBooking.price}
          onSuccess={(paymentMethod, paymentId) => submitBooking(paymentMethod, paymentId)}
          onCancel={() => { setShowPaymentModal(false); setShowBookingModal(true) }}
        />
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon} {label}
      </span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

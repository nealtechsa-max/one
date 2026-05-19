import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BookingCalendar from '@/components/booking/BookingCalendar'
import { prisma } from '@/lib/prisma'

async function getData() {
  const [spaces, hours, settings] = await Promise.all([
    prisma.studioSpace.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.studioHours.findMany({ orderBy: { dayOfWeek: 'asc' } }),
    prisma.siteSettings.findFirst(),
  ])
  return { spaces, hours, settings }
}

export default async function BookPage() {
  const { spaces, hours, settings } = await getData()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Book a Space</h1>
          <p className="text-sm text-gray-500 mt-1">Select a space, pick your date and time, and confirm your booking.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">
            Loading calendar…
          </div>
        }>
          <BookingCalendar spaces={spaces} studioHours={hours} settings={settings} />
        </Suspense>
      </div>

      <Footer />
    </div>
  )
}

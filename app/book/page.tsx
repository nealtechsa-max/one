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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Book a Space</h1>
          <p className="text-gray-500 mt-1">Select a space, choose your time, and confirm your booking.</p>
        </div>
        <Suspense fallback={<div className="flex items-center justify-center py-16 text-gray-400">Loading calendar...</div>}>
          <BookingCalendar
            spaces={spaces}
            studioHours={hours}
            settings={settings}
          />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}

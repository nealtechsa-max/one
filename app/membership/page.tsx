import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import MembershipClient from './client'

export default async function MembershipPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MembershipClient plans={JSON.parse(JSON.stringify(plans))} />
      <Footer />
    </div>
  )
}

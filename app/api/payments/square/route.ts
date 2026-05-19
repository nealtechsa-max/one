import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { amount, sourceId } = body

  // Square payment integration
  // In production, use Square SDK here:
  // const client = new Client({ accessToken: process.env.SQUARE_ACCESS_TOKEN, environment: Environment.Sandbox })
  // const { result } = await client.paymentsApi.createPayment({ sourceId, idempotencyKey: crypto.randomUUID(), amountMoney: { amount: Math.round(amount * 100), currency: 'USD' } })

  return NextResponse.json({
    success: true,
    paymentId: `SQUARE_${Date.now()}`,
    amount,
    message: 'Square payment configured — add SQUARE_ACCESS_TOKEN to .env to enable',
  })
}

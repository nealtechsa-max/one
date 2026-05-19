'use client'

import { useState } from 'react'
import { X, CreditCard, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface PaymentModalProps {
  amount: number
  onSuccess: (paymentMethod: string, paymentId: string) => void
  onCancel: () => void
}

export default function PaymentModal({ amount, onSuccess, onCancel }: PaymentModalProps) {
  const [method, setMethod] = useState<'PAYPAL' | 'SQUARE'>('PAYPAL')
  const [loading, setLoading] = useState(false)

  // Square placeholder (requires Square Web Payments SDK with valid credentials)
  const handleSquarePay = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payments/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (data.paymentId) {
        onSuccess('SQUARE', data.paymentId)
      }
    } catch {
      alert('Square payment failed. Please try PayPal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">Secure Payment</h2>
            <p className="text-sm text-gray-500 mt-0.5">Total: <strong className="text-gray-900">{formatCurrency(amount)}</strong></p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Method selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setMethod('PAYPAL')}
              className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${method === 'PAYPAL' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <div className="text-2xl mb-1">🅿</div>
              PayPal
            </button>
            <button
              onClick={() => setMethod('SQUARE')}
              className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${method === 'SQUARE' ? 'border-black bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              <div className="text-2xl mb-1">⬛</div>
              Square
            </button>
          </div>

          {/* PayPal */}
          {method === 'PAYPAL' && (
            <div>
              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4fYMObodsiCkB4fh9X1',
                  currency: 'USD',
                }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect', color: 'blue' }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: 'CAPTURE',
                      purchase_units: [{
                        amount: {
                          value: amount.toFixed(2),
                          currency_code: 'USD',
                        },
                        description: 'Motive 8 Creative Studio Booking',
                      }],
                    })
                  }}
                  onApprove={async (data, actions) => {
                    const order = await actions.order?.capture()
                    onSuccess('PAYPAL', order?.id || data.orderID)
                  }}
                  onError={() => {
                    alert('PayPal error. Please try again.')
                  }}
                />
              </PayPalScriptProvider>
            </div>
          )}

          {/* Square */}
          {method === 'SQUARE' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center text-sm text-gray-500">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                Square payment requires configuration. Contact admin to enable Square payments.
              </div>
              <button
                onClick={handleSquarePay}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ${formatCurrency(amount)} with Square`}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onCancel} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Go back
          </button>
        </div>
      </div>
    </div>
  )
}

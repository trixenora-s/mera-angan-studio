'use client'

import { useEffect, useState } from 'react'
import { CartItem } from '@/types'
import { useSession } from 'next-auth/react'

declare global {
  interface Window {
    Razorpay?: any
  }
}

const loadScript = async () => {
  if (typeof window === 'undefined') {
    return
  }

  if (document.getElementById('razorpay-sdk')) {
    return
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

interface PaymentSectionProps {
  orderData: {
    addressId?: string
    guestAddress?: {
      full_address: string
      city: string
      state: string
      pincode: string
    }
    eventDate: string
    specialInstructions: string
  }
  cartItems: CartItem[]
  couponCode?: string
  onSuccess: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  onBack: () => void
}

export default function PaymentSection({ orderData, cartItems, couponCode, onSuccess, onBack }: PaymentSectionProps): JSX.Element {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadScript()
  }, [])

  const submitOrder = async () => {
    setErrorMessage('')

    if (!orderData.eventDate) {
      setErrorMessage('Please confirm the event date before payment.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            event_date: item.event_date ?? orderData.eventDate,
            event_address_id: item.event_address_id,
            event_address_text: item.event_address_text,
            custom_notes: item.custom_notes,
          })),
          addressId: orderData.addressId,
          guestAddress: orderData.guestAddress,
          couponCode: couponCode ?? undefined,
          specialInstructions: orderData.specialInstructions,
          eventDate: orderData.eventDate,
        })),
      })

      if (!response.ok) {
        const payload = await response.json()
        setErrorMessage(payload?.error || 'Unable to create order. Please try again.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const razorpay = window.Razorpay

      if (!razorpay) {
        setErrorMessage('Razorpay checkout failed to load. Please refresh.')
        setIsLoading(false)
        return
      }

      const checkout = new razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'EventDecor',
        description: 'Event Decoration Booking',
        order_id: data.razorpayOrderId,
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: (response: any) => {
          onSuccess(response)
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          },
        },
      })

      checkout.open()
    } catch (error) {
      setErrorMessage('Unable to start payment. Please try again.')
      setIsLoading(false)
      console.error(error)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Payment</h2>
        <p className="mt-4 text-sm text-slate-600">
          Razorpay will securely process your payment. Choose UPI, cards, net banking, or wallets.
        </p>

        <div className="mt-8 space-y-4 rounded-3xl bg-slate-50 p-6 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Order total</span>
            <span>₹{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
          </div>
          {couponCode ? (
            <div className="flex justify-between text-green-700">
              <span>Coupon applied</span>
              <span>{couponCode}</span>
            </div>
          ) : null}
          <div className="text-sm text-slate-500">
            {session ? 'Payment will be linked to your authenticated account.' : 'Complete payment as a guest if you are not signed in.'}
          </div>
        </div>

        {errorMessage ? <p className="mt-6 text-sm text-red-600">{errorMessage}</p> : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={submitOrder}
            disabled={isLoading}
            className="w-full rounded-3xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? 'Starting payment…' : 'Pay Now'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Review
          </button>
        </div>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Billing Summary</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{cartItems.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected date</span>
            <span>{orderData.eventDate || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment provider</span>
            <span>Razorpay</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

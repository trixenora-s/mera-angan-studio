'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AddressForm from '@/components/checkout/AddressForm'
import PaymentSection from '@/components/checkout/PaymentSection'
import { useCart } from '@/hooks/useCart'
import { CartItem } from '@/types'

const STEPS = ['Delivery Details', 'Order Review', 'Payment'] as const

type OrderAddressPayload = {
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

type Step = (typeof STEPS)[number]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const items = useCart((state) => state.items)
  const [stepIndex, setStepIndex] = useState(0)
  const [orderData, setOrderData] = useState<OrderAddressPayload>({
    addressId: undefined,
    guestAddress: undefined,
    eventDate: items?.[0]?.event_date || '',
    specialInstructions: '',
  })
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined)

  const currentStep = STEPS[stepIndex]

  const nextStep = () => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
  const prevStep = () => setStepIndex((prev) => Math.max(prev - 1, 0))

  const handleDeliveryContinue = (payload: OrderAddressPayload) => {
    setOrderData(payload)
    nextStep()
  }

  const handlePaymentSuccess = async (response: any) => {
    const verifyResult = await fetch('/api/orders/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }),
    })

    if (!verifyResult.ok) {
      return
    }

    const { orderId } = await verifyResult.json()
    router.push(`/checkout/success?orderId=${orderId}`)
  }

  const summaryTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Your cart is empty</h1>
          <p className="mt-4 text-slate-600">Add packages to your cart before starting checkout.</p>
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="mt-8 rounded-3xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Checkout</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Complete your booking</h1>
            <p className="mt-2 text-slate-600">Secure payment, delivery details, and order review.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-700 shadow-sm">
            <p className="font-semibold text-slate-900">Order total</p>
            <p className="mt-1 text-2xl">₹{summaryTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {STEPS.map((label, index) => (
              <div
                key={label}
                className={`rounded-3xl px-4 py-4 ${index === stepIndex ? 'bg-primary-600 text-white' : index < stepIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {currentStep === 'Delivery Details' ; (
            <AddressForm items={items} onContinue={handleDeliveryContinue} />
          )}

          {currentStep === 'Order Review' && (
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Order Review</h2>
                    <p className="mt-2 text-sm text-slate-600">Confirm your items, event date, and delivery address.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/cart')}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Edit Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-3xl border border-slate-200 p-4">
                      <img src={item.product_image} alt={item.product_name} className="h-24 w-24 rounded-3xl object-cover" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{item.product_name}</h3>
                        <p className="mt-2 text-sm text-slate-600">Qty: {item.quantity}</p>
                        <p className="mt-1 text-sm text-slate-600">Event date: {item.event_date ; orderData.eventDate ; 'Not selected'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Delivery Summary</h3>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">Event date</p>
                    <p>{orderData.eventDate ; 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Address</p>
                    <p>{orderData.guestAddress ? `${orderData.guestAddress.full_address}, ${orderData.guestAddress.city}` : 'Saved address selected'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Instructions</p>
                    <p>{orderData.specialInstructions ; 'No special instructions'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="mt-8 w-full rounded-3xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Continue to Payment
                </button>
                <button
                  type="button"
                  onClick={prevStep}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Delivery
                </button>
              </aside>
            </div>
          )}

          {currentStep === 'Payment' ; (
            <PaymentSection
              orderData={orderData}
              cartItems={items}
              couponCode={couponCode}
              onSuccess={handlePaymentSuccess}
              onBack={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Address, CartItem } from '@/types'
import { addressSchema } from '@/lib/validations'
import { z } from 'zod'

interface AddressFormProps {
  items: CartItem[]
  onContinue: (payload: {
    addressId?: string
    guestAddress?: {
      full_address: string
      city: string
      state: string
      pincode: string
    }
    eventDate: string
    specialInstructions: string
  }) => void
}

const guestSchema = z.object({
  full_address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
})

export default function AddressForm({ items, onContinue }: AddressFormProps) {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [guestAddress, setGuestAddress] = useState({ full_address: '', city: '', state: '', pincode: '' })
  const [eventDate, setEventDate] = useState(items[0]?.event_date ?? '')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  useEffect(() => {
    if (!session) {
      return
    }

    const fetchAddresses = async () => {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      }
    }

    fetchAddresses()
  }, [session])

  const handleSaveAddress = async () => {
    const parsed = addressSchema.pick({ full_address: true, city: true, state: true, pincode: true }).safeParse(guestAddress)

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      const fieldErrors: Record<string, string> = {}
      Object.entries(flattened).forEach(([key, value]) => {
        if (value?.[0]) fieldErrors[key] = value[0]
      })
      setErrors(fieldErrors)
      return
    }

    setIsSavingAddress(true)
    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })
    setIsSavingAddress(false)

    if (!response.ok) {
      setErrors({ form: 'Unable to save address. Please try again.' })
      return
    }

    const data = await response.json()
    setAddresses((current) => [...current, data.address])
    setSelectedAddressId(data.address.id)
    setShowNewAddressForm(false)
    setErrors({})
  }

  const handleContinue = () => {
    const fieldErrors: Record<string, string> = {}

    if (!eventDate) {
      fieldErrors.eventDate = 'Please select an event date.'
    }

    if (session) {
      if (!selectedAddressId && !showNewAddressForm) {
        fieldErrors.address = 'Select a saved address or add one.'
      }
    } else {
      const parsed = guestSchema.safeParse(guestAddress)
      if (!parsed.success) {
        parsed.error.errors.forEach((error) => {
          const key = error.path[0]?.toString() || 'form'
          fieldErrors[key] = error.message
        })
      }
    }

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onContinue({
      addressId: selectedAddressId || undefined,
      guestAddress: session ? undefined : guestAddress,
      eventDate,
      specialInstructions,
    })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Delivery Details</h2>

        {session ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Saved Addresses</h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm((prev) => !prev)}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {showNewAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-sm text-slate-500">No saved addresses found. Add one to continue.</p>
            ) : (
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(address.id)
                      setShowNewAddressForm(false)
                    }}
                    className={`rounded-3xl border p-4 text-left transition ${
                      selectedAddressId === address.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{address.label || 'Saved Address'}</p>
                    <p className="mt-1 text-sm text-slate-600">{address.full_address}</p>
                    <p className="mt-1 text-sm text-slate-500">{address.city}, {address.state} {address.pincode}</p>
                  </button>
                ))}
              </div>
            )}

            {errors.address ? <p className="text-sm text-red-600">{errors.address}</p> : null}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Address</label>
              <textarea
                value={guestAddress.full_address}
                onChange={(event) => setGuestAddress((prev) => ({ ...prev, full_address: event.target.value }))}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                rows={3}
              />
              {errors.full_address ? <p className="mt-2 text-sm text-red-600">{errors.full_address}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                City
                <input
                  value={guestAddress.city}
                  onChange={(event) => setGuestAddress((prev) => ({ ...prev, city: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {errors.city ? <p className="mt-2 text-sm text-red-600">{errors.city}</p> : null}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                State
                <input
                  value={guestAddress.state}
                  onChange={(event) => setGuestAddress((prev) => ({ ...prev, state: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {errors.state ? <p className="mt-2 text-sm text-red-600">{errors.state}</p> : null}
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Pincode
              <input
                value={guestAddress.pincode}
                onChange={(event) => setGuestAddress((prev) => ({ ...prev, pincode: event.target.value }))}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
              {errors.pincode ? <p className="mt-2 text-sm text-red-600">{errors.pincode}</p> : null}
            </label>
          </div>
        )}

        {showNewAddressForm ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Add New Address</h3>
            <div className="mt-4 grid gap-4">
              <label className="block text-sm font-semibold text-slate-700">
                Full Address
                <textarea
                  value={guestAddress.full_address}
                  onChange={(event) => setGuestAddress((prev) => ({ ...prev, full_address: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  rows={3}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  City
                  <input
                    value={guestAddress.city}
                    onChange={(event) => setGuestAddress((prev) => ({ ...prev, city: event.target.value }))}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  State
                  <input
                    value={guestAddress.state}
                    onChange={(event) => setGuestAddress((prev) => ({ ...prev, state: event.target.value }))}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Pincode
                <input
                  value={guestAddress.pincode}
                  onChange={(event) => setGuestAddress((prev) => ({ ...prev, pincode: event.target.value }))}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className="mt-4 rounded-3xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSavingAddress ? 'Saving...' : 'Save Address'}
              </button>
              {errors.form ? <p className="mt-2 text-sm text-red-600">{errors.form}</p> : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Event Details</h3>
        <label className="mt-5 block text-sm text-slate-600">
          Event date
          <input
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>
        {errors.eventDate ? <p className="mt-2 text-sm text-red-600">{errors.eventDate}</p> : null}

        <label className="mt-5 block text-sm text-slate-600">
          Special instructions
          <textarea
            value={specialInstructions}
            onChange={(event) => setSpecialInstructions(event.target.value)}
            rows={4}
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="Add notes for the design team, delivery window, or setup requests"
          />
        </label>

        <button
          type="button"
          onClick={handleContinue}
          className="mt-8 w-full rounded-3xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Continue
        </button>
      </section>
    </div>
  )
}

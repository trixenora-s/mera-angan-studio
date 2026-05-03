'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'

const eventTypes = [
  'Birthdays',
  'Weddings',
  'Anniversary',
  'Engagement',
  'Baby Shower',
  'Haldi Ceremony',
  'Mehendi Ceremony',
  'Corporate Event',
  'Themed Party',
  'Bridal Shower',
  'Graduation',
  'Festival Celebration',
  'Product Launch',
  'Other',
]

const budgetRanges = ['Under ₹5k', '₹5k-₹15k', '₹15k-₹30k', '₹30k+'] as const

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  eventType: z.string().min(1, 'Select an event type'),
  eventDate: z.string().refine((value) => {
    const selected = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selected > today
  }, 'Choose a future event date'),
  budgetRange: z.enum(budgetRanges),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  eventType: 'Birthdays',
  eventDate: '',
  budgetRange: 'Under ₹5k',
  message: '',
}

export default function ContactPage() {
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const minDate = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }, [])

  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapSrc = mapKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=EventDecor+Studio+Mumbai,India`
    : undefined

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setStatus('idle')
    setFeedback('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    const parsed = contactSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((error) => {
        const field = error.path[0] as string
        fieldErrors[field] = error.message
      })
      setErrors(fieldErrors)
      setStatus('error')
      setFeedback('Please fix the highlighted fields.')
      return
    }

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    const payload = await response.json()

    if (!response.ok) {
      setStatus('error')
      setFeedback(payload?.error || 'Unable to send your message. Please try again later.')
      return
    }

    setStatus('success')
    setFeedback('Message sent successfully! We will reach out within one business day.')
    setFormData(initialFormState)
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] bg-white p-10 shadow-xl">
            <h1 className="text-4xl font-semibold text-slate-900">Contact Information</h1>
            <p className="mt-4 text-slate-600">Reach out to our event design team for a custom quote, availability, or planning support.</p>

            <div className="mt-10 space-y-8 text-slate-700">
              <div>
                <h2 className="text-lg font-semibold">Address</h2>
                <p className="mt-2 text-slate-600">[REPLACE WITH YOUR BUSINESS ADDRESS]</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Phone</h2>
                <p className="mt-2 text-slate-600">[REPLACE WITH YOUR BUSINESS PHONE]</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Email</h2>
                <p className="mt-2 text-slate-600">[REPLACE WITH YOUR BUSINESS EMAIL]</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Business Hours</h2>
                <p className="mt-2 text-slate-600">Monday to Saturday • 9:00 AM – 7:00 PM</p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl overflow-hidden border border-slate-200">
              {mapSrc ? (
                <iframe
                  title="Business location"
                  src={mapSrc}
                  className="h-96 w-full"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-96 items-center justify-center bg-slate-100 text-slate-500">
                  Google Maps key missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-100">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-100">Facebook</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-100">YouTube</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-100">Pinterest</a>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-10 shadow-xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Contact Form</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Send us a message</h2>
              <p className="mt-3 text-slate-600">Fill out the form below and our planning team will contact you shortly.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Full Name
                  <input
                    value={formData.fullName}
                    onChange={(event) => handleChange('fullName', event.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                  {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName}</p> : null}
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                  {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700 block">
                Phone
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Event Type
                  <select
                    value={formData.eventType}
                    onChange={(event) => handleChange('eventType', event.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.eventType ? <p className="text-sm text-rose-600">{errors.eventType}</p> : null}
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Event Date
                  <input
                    type="date"
                    min={minDate}
                    value={formData.eventDate}
                    onChange={(event) => handleChange('eventDate', event.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    required
                  />
                  {errors.eventDate ? <p className="text-sm text-rose-600">{errors.eventDate}</p> : null}
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700 block">
                Budget Range
                <select
                  value={formData.budgetRange}
                    onChange={(event) => handleChange('budgetRange', event.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  {budgetRanges.map((budget) => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 block">
                Message
                <textarea
                  rows={6}
                  value={formData.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
                {errors.message ? <p className="text-sm text-rose-600">{errors.message}</p> : null}
              </label>

              {feedback ? (
                <p className={`text-sm ${status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{feedback}</p>
              ) : null}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {status === 'loading' ? 'Sending message...' : 'Send Message'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'
import { limitContactRequest } from '@/lib/rate-limit'

const contactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  eventType: z.string().min(1),
  eventDate: z.string().refine((value) => {
    const date = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }, 'Event date must be in the future'),
  budgetRange: z.enum(['Under ₹5k', '₹5k-₹15k', '₹15k-₹30k', '₹30k+']),
  message: z.string().min(20),
})

const businessEmail = process.env.BUSINESS_EMAIL ?? 'contact@eventdecor.com'
const resendKey = process.env.RESEND_API_KEY
const resendFrom = process.env.RESEND_FROM_EMAIL ?? `no-reply@${process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'eventdecor.com'}`

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || 'unknown'

  const rateLimit = await limitContactRequest(`contact:${ip}`)

  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many contact requests. Please try again again later.' }, { status: 429 })
  }

  const body = await request.json()
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors.map((err) => err.message).join(', ') }, { status: 400 })
  }

  const service = createServiceRoleClient()

  const submission = {
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    event_type: parsed.data.eventType,
    event_date: parsed.data.eventDate,
    budget_range: parsed.data.budgetRange,
    message: parsed.data.message,
    ip_address: ip,
  }

  await service.from('contact_submissions').insert(submission)

  if (resendKey) {
    const emailPayload = {
      from: resendFrom,
      to: [businessEmail],
      subject: `New contact inquiry from ${parsed.data.fullName}`,
      html: `
        <h1>New contact inquiry</h1>
        <p><strong>Name:</strong> ${parsed.data.fullName}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Phone:</strong> ${parsed.data.phone ?? 'N/A'}</p>
        <p><strong>Event Type:</strong> ${parsed.data.eventType}</p>
        <p><strong>Event Date:</strong> ${parsed.data.eventDate}</p>
        <p><strong>Budget Range:</strong> ${parsed.data.budgetRange}</p>
        <p><strong>Message:</strong> ${parsed.data.message}</p>
      `,
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [parsed.data.email],
        subject: 'Thanks for contacting EventDecor',
        html: `
          <p>Hi ${parsed.data.fullName},</p>
          <p>Thank you for reaching out. We have received your request and our team will follow up within one business day.</p>
          <p>Event type: ${parsed.data.eventType}</p>
          <p>Event date: ${parsed.data.eventDate}</p>
          <p>Budget range: ${parsed.data.budgetRange}</p>
          <p>Message: ${parsed.data.message}</p>
          <p>Warm regards,<br/>EventDecor Team</p>
        `,
      }),
    })
  }

  return NextResponse.json({ success: true })
}

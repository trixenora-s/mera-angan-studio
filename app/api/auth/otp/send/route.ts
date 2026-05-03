import { limitOtpRequest } from '@/lib/rate-limit'
import { sendPhoneOtp } from '@/lib/twilio'

const NEXTAUTH_URL = (globalThis as any).process?.env?.NEXTAUTH_URL
const allowedOrigins = [NEXTAUTH_URL, 'http://localhost:3000'].filter(Boolean) as string[]

function isValidOrigin(origin: string | null) {
  return origin ? allowedOrigins.indexOf(origin) !== -1 : false
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!isValidOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Invalid origin header' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const phone = body?.phone?.toString().trim()
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Phone number is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rateKey = `otp:${phone}`
  const result = await limitOtpRequest(rateKey)
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Too many OTP requests. Try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sent = await sendPhoneOtp(phone)
  if (!sent) {
    return new Response(JSON.stringify({ error: 'Unable to send OTP. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

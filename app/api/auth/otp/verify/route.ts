import { createPhoneLoginToken } from '@/lib/rate-limit'
import { verifyPhoneOtp } from '@/lib/twilio'
import { createServiceRoleClient } from '@/lib/supabase'

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
  const code = body?.code?.toString().trim()

  if (!phone || !code) {
    return new Response(JSON.stringify({ error: 'Phone and OTP code are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const valid = await verifyPhoneOtp(phone, code)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const loginToken = await createPhoneLoginToken(phone)

  const supabase = createServiceRoleClient()
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Phone profile fetch error:', fetchError)
  }

  let isNewUser = false
  if (!existingProfile) {
    isNewUser = true
    await supabase.from('profiles').insert({ phone, created_at: new Date().toISOString() })
  }

  return new Response(JSON.stringify({ success: true, token: loginToken, isNewUser }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

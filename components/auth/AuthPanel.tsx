'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { GoogleSignInButton } from './GoogleSignInButton'
import { PhoneOTPForm } from './PhoneOTPForm'

const sanitizePhone = (value: string) => value.replace(/[^0-9]/g, '')

export function AuthPanel({ initialMode }: { initialMode: 'login' | 'signup' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [mode, setMode] = useState(initialMode)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone')
  const [countdown, setCountdown] = useState(0)
  const [verificationToken, setVerificationToken] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown])

  const text = useMemo(() => ({
    header: mode === 'login' ? 'Welcome back' : 'Create your account',
    subtitle: mode === 'login'
      ? 'Sign in quickly with Google or OTP.'
      : 'Sign up using phone number and OTP.',
    toggle: mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in',
  }), [mode])

  const handleSendOtp = async () => {
    setError('')
    const formattedPhone = `+91${sanitizePhone(phone)}`
    if (formattedPhone.length < 11) {
      setError('Please enter a valid mobile number.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send OTP')
      }

      setStep('otp')
      setCountdown(60)
    } catch (error_) {
      setError((error_ as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    const formattedPhone = `+91${sanitizePhone(phone)}`
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, code }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'OTP verification failed')
      }

      setVerificationToken(data.token)
      setIsNewUser(data.isNewUser === true)
      setLoading(false)

      if (data.isNewUser) {
        setStep('profile')
      } else {
        await finishSignIn(formattedPhone, data.token)
      }
    } catch (error_) {
      setError((error_ as Error).message)
      setLoading(false)
    }
  }

  const handleCompleteProfile = async () => {
    setError('')
    if (!fullName) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${sanitizePhone(phone)}`, token: verificationToken, full_name: fullName, email: email || null }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to complete profile setup')
      }

      await finishSignIn(`+91${sanitizePhone(phone)}`, verificationToken)
    } catch (error_) {
      setError((error_ as Error).message)
      setLoading(false)
    }
  }

  const finishSignIn = async (phoneNumber: string, token: string) => {
    const result = await signIn('credentials', {
      phone: phoneNumber,
      token,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push((result as any).url || callbackUrl)
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-white/20 bg-white/30 p-6 shadow-2xl backdrop-blur-3xl sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Welcome</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {text.header}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            {text.subtitle}
          </p>
          <div className="mt-8">
            <GoogleSignInButton />
          </div>
          <div className="relative my-8 h-px bg-slate-200">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-slate-500">or</span>
          </div>
        </div>

        <PhoneOTPForm
          phone={phone}
          code={code}
          step={step}
          isNewUser={isNewUser}
          loading={loading}
          error={error}
          fullName={fullName}
          email={email}
          onPhoneChange={(value) => setPhone(value)}
          onCodeChange={(value) => setCode(value)}
          onFullNameChange={(value) => setFullName(value)}
          onEmailChange={(value) => setEmail(value)}
          onSendOtp={handleSendOtp}
          onVerifyOtp={handleVerifyOtp}
          onCompleteProfile={handleCompleteProfile}
          countdown={countdown}
        />
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
        <span>{text.toggle}</span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setStep('phone')
            setError('')
          }}
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

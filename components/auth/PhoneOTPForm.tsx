'use client'

import { useMemo, useState } from 'react'

interface PhoneOTPFormProps {
  phone: string
  code: string
  step: 'phone' | 'otp' | 'profile'
  isNewUser: boolean
  loading: boolean
  error?: string
  fullName?: string
  email?: string
  onPhoneChange: (value: string) => void
  onCodeChange: (value: string) => void
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSendOtp: () => void
  onVerifyOtp: () => void
  onCompleteProfile: () => void
  countdown: number
}

export function PhoneOTPForm({
  phone,
  code,
  step,
  isNewUser,
  loading,
  error,
  fullName,
  email,
  onPhoneChange,
  onCodeChange,
  onFullNameChange,
  onEmailChange,
  onSendOtp,
  onVerifyOtp,
  onCompleteProfile,
  countdown,
}: PhoneOTPFormProps) {
  const isWaiting = step === 'otp'

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/20 bg-white/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <span className="rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            {step === 'profile' ? 'Complete account' : 'Phone login'}
          </span>
          <p className="text-sm text-slate-500">
            Secure OTP-based sign in with SMS verification.
          </p>
        </div>

        {step === 'phone' && (
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Mobile number</label>
            <div className="flex items-center gap-2">
              <span className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Enter mobile number"
                className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={loading}
              className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Enter OTP</label>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              maxLength={6}
              placeholder="6-digit code"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
            />
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{countdown > 0 ? `Expires in ${countdown}s` : 'OTP expired'}</span>
              <button
                type="button"
                onClick={onSendOtp}
                disabled={loading}
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Resend
              </button>
            </div>
            <button
              type="button"
              onClick={onVerifyOtp}
              disabled={loading}
              className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="example@yourmail.com"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={onCompleteProfile}
              disabled={loading}
              className="w-full rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Completing…' : 'Complete Account'}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

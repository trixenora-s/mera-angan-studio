'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export function GoogleSignInButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      <img src="/icons/google.svg" alt="Google logo" className="h-5 w-5" />
      Continue with Google
    </button>
  )
}

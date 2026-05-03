import { AuthPanel } from '@/components/auth/AuthPanel'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_35%),linear-gradient(180deg,_#0b1220,_#1e1f38)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="relative overflow-hidden rounded-[36px] bg-white/10 p-8 shadow-lg shadow-slate-900/10 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_28%)] after:absolute after:bottom-0 after:right-0 after:h-48 after:w-48 after:rounded-full after:bg-[radial-gradient(circle,_rgba(168,85,247,0.18),_transparent_36%)]">
            <AuthPanel initialMode="login" />
          </div>
        </div>
      </div>
    </div>
  )
}

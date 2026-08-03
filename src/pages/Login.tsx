import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { session, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email.trim(), password)
    setSubmitting(false)

    if (signInError) {
      setError(signInError)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <p className="section-label mb-3">Sign in</p>
      <h1 className="mb-2 font-display text-3xl font-bold text-navy">Dr Data Pulse</h1>
      <p className="mb-8 text-sm leading-relaxed text-navy/70">
        Private dashboard access. Use the account created for this Supabase project.
      </p>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-navy/15 bg-cream/40 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-navy/15 bg-cream/40 px-3 py-2.5 text-sm text-navy outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </label>

        {error ? (
          <p className="mb-4 rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting || loading}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

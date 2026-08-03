import { Link } from 'react-router-dom'
import { Shield, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="section-label mb-4">Private decision intelligence</p>
      <h1 className="mb-4 max-w-3xl font-display text-4xl font-bold leading-tight text-navy sm:text-5xl">
        Capture every interaction. Turn the history into strategy.
      </h1>
      <p className="mb-8 max-w-2xl text-lg leading-relaxed text-navy/70">
        The digital card is the front door. The accumulated decision engine is the product. Public capture stays fast
        in the cloud. Intelligence built from your history stays under your control.
      </p>

      <div className="mb-14 flex flex-wrap gap-3">
        <Link to="/dashboard" className="btn-primary">
          <Sparkles className="h-4 w-4" />
          Open dashboard shell
        </Link>
        <a
          href="https://drdatadecisionintelligence.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Main site
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-2 font-display text-xl font-semibold text-navy">Public layer</h2>
          <p className="text-sm leading-relaxed text-navy/70">
            vCard, review flow, booking, and enrichment. Public actions that accumulate the events the engine will
            use later.
          </p>
        </article>
        <article className="rounded-2xl bg-navy p-6 text-white shadow-card">
          <div className="mb-3 flex items-center gap-2 text-teal">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Private later</span>
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold">Accumulated layer</h2>
          <p className="text-sm leading-relaxed text-white/75">
            Strategy over your history in a database you control. Never shared, never sold, never used to train
            anyone else&apos;s model.
          </p>
        </article>
      </div>
    </div>
  )
}

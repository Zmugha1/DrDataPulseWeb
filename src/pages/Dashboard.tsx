import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { partitionScoredLeads, scoreLeads, type ScoredLead } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadEvent } from '@/lib/types'

function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function cell(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '-'
}

function bucketBadgeClass(bucket: ScoredLead['score']['bucket']): string {
  if (bucket === 'HOT') return 'bg-coral text-white'
  if (bucket === 'WARM') return 'bg-teal text-navy'
  if (bucket === 'COOL') return 'bg-muted text-white'
  return 'bg-navy/10 text-navy'
}

function bucketLabel(bucket: ScoredLead['score']['bucket']): string {
  if (bucket === 'NOT_SALES') return 'Not a sales lead'
  return bucket
}

function LeadBreakdown({ lead }: { lead: ScoredLead }) {
  const { lines, total } = lead.score
  return (
    <div className="border-t border-cream bg-cream/40 px-4 py-4 sm:px-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
        Why this score?
      </p>
      {lines.length === 0 ? (
        <p className="text-sm text-navy/70">No scoring signals fired for this lead.</p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line) => (
            <li
              key={`${line.signal}-${line.reason}`}
              className="flex items-start justify-between gap-4 text-sm text-navy"
            >
              <div>
                <p className="font-medium">{line.signal}</p>
                <p className="text-navy/70">{line.reason}</p>
              </div>
              <span className="shrink-0 font-display font-semibold text-teal">
                +{line.points}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-cream pt-3 text-sm">
        <span className="font-display font-semibold text-navy">Total</span>
        <span className="font-display text-base font-bold text-navy">{total}</span>
      </div>
    </div>
  )
}

function RankedLeadRow({
  lead,
  open,
  onToggle,
}: {
  lead: ScoredLead
  open: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr className="border-t border-cream align-top text-navy hover:bg-cream/50">
        <td className="px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="font-display text-lg font-bold text-navy">{lead.score.total}</span>
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${bucketBadgeClass(lead.score.bucket)}`}
            >
              {bucketLabel(lead.score.bucket)}
            </span>
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              className="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal hover:bg-teal/10"
            >
              Why this score?
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </td>
        <td className="px-4 py-3 font-medium sm:px-5">{cell(lead.name)}</td>
        <td className="px-4 py-3 text-navy/80 sm:px-5">{cell(lead.email)}</td>
        <td className="px-4 py-3 text-navy/80 sm:px-5">{cell(lead.source)}</td>
        <td className="px-4 py-3 text-navy/80 sm:px-5">{cell(lead.stage)}</td>
        <td className="whitespace-nowrap px-4 py-3 text-navy/80 sm:px-5">
          {formatDate(lead.created_at)}
        </td>
        <td className="max-w-xs px-4 py-3 text-navy/70 sm:max-w-sm sm:px-5">
          <span className="line-clamp-3 whitespace-pre-wrap break-words">{cell(lead.notes)}</span>
        </td>
      </tr>
      {open ? (
        <tr className="border-t border-cream">
          <td colSpan={7} className="p-0">
            <LeadBreakdown lead={lead} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

export default function Dashboard() {
  const { userEmail, session } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!session) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const [leadsResult, eventsResult] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*'),
      ])

      if (cancelled) return

      if (leadsResult.error) {
        setError(leadsResult.error.message)
        setLeads([])
        setEvents([])
        setLoading(false)
        return
      }

      if (eventsResult.error) {
        setError(eventsResult.error.message)
        setLeads((leadsResult.data as Lead[]) ?? [])
        setEvents([])
        setLoading(false)
        return
      }

      setLeads((leadsResult.data as Lead[]) ?? [])
      setEvents((eventsResult.data as LeadEvent[]) ?? [])
      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [session])

  const scored = scoreLeads(leads, events)
  const { ranked, notSales } = partitionScoredLeads(scored)

  function toggleOpen(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="section-label mb-4">Dashboard</p>
      <h1 className="mb-3 font-display text-3xl font-bold text-navy sm:text-4xl">Pulse dashboard</h1>
      <p className="mb-8 max-w-2xl text-navy/70">
        Signed in{userEmail ? ` as ${userEmail}` : ''}. Leads ranked by deterministic score
        {events.length > 0 ? ` · ${events.length} event${events.length === 1 ? '' : 's'} loaded` : ''}.
      </p>

      {loading ? (
        <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-teal/20 bg-white shadow-card">
          <div className="flex items-center gap-3 text-sm text-navy/60" role="status">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-teal/30 border-t-teal"
              aria-hidden
            />
            Loading leads...
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div
          className="rounded-2xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-navy"
          role="alert"
        >
          <p className="font-semibold text-coral">Could not load leads</p>
          <p className="mt-1 text-navy/80">{error}</p>
        </div>
      ) : null}

      {!loading && !error && leads.length === 0 ? (
        <div className="rounded-2xl border border-teal/20 bg-white p-8 text-center shadow-card">
          <h2 className="mb-2 font-display text-xl font-semibold text-navy">No leads yet</h2>
          <p className="text-sm text-navy/70">
            Authenticated read succeeded, but the leads table is empty.
          </p>
        </div>
      ) : null}

      {!loading && !error && ranked.length > 0 ? (
        <section className="mb-10 overflow-hidden rounded-2xl border border-teal/20 bg-white shadow-card">
          <div className="border-b border-cream bg-cream/80 px-4 py-3 sm:px-5">
            <h2 className="font-display text-lg font-semibold text-navy">
              Ranked leads <span className="text-sm font-medium text-teal">({ranked.length})</span>
            </h2>
            <p className="mt-1 text-xs text-navy/60">Highest score first. Work the top of the list next.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-teal">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Score</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Name</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Email</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Source</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Stage</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Created</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((lead) => (
                  <RankedLeadRow
                    key={lead.id}
                    lead={lead}
                    open={Boolean(openIds[lead.id])}
                    onToggle={() => toggleOpen(lead.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && !error && notSales.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
          <div className="border-b border-cream bg-cream/80 px-4 py-3 sm:px-5">
            <h2 className="font-display text-lg font-semibold text-navy">
              Not sales leads{' '}
              <span className="text-sm font-medium text-muted">({notSales.length})</span>
            </h2>
            <p className="mt-1 text-xs text-navy/60">
              Careers and zero-score contacts. Excluded from the ranked work list.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Name</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Email</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Source</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Stage</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Created</th>
                  <th className="px-4 py-3 font-semibold sm:px-5">Notes</th>
                </tr>
              </thead>
              <tbody>
                {notSales.map((lead) => (
                  <tr key={lead.id} className="border-t border-cream align-top text-navy/80">
                    <td className="px-4 py-3 font-medium text-navy sm:px-5">{cell(lead.name)}</td>
                    <td className="px-4 py-3 sm:px-5">{cell(lead.email)}</td>
                    <td className="px-4 py-3 sm:px-5">{cell(lead.source)}</td>
                    <td className="px-4 py-3 sm:px-5">{cell(lead.stage)}</td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-navy/70 sm:max-w-sm sm:px-5">
                      <span className="line-clamp-3 whitespace-pre-wrap break-words">
                        {cell(lead.notes)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && !error && leads.length > 0 && ranked.length === 0 && notSales.length === 0 ? (
        <div className="rounded-2xl border border-teal/20 bg-white p-8 text-center shadow-card">
          <h2 className="mb-2 font-display text-xl font-semibold text-navy">No leads to show</h2>
        </div>
      ) : null}
    </div>
  )
}

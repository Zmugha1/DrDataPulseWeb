import { useEffect, useState, type FocusEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import MarketWatch from '@/components/MarketWatch'
import { useAuth } from '@/context/AuthContext'
import { useMarketWatch } from '@/hooks/useMarketWatch'
import { partitionScoredLeads, scoreLeads, type ScoredLead } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadEvent } from '@/lib/types'
import {
  WORK_STATUSES,
  displayWorkStatus,
  isClosedWorkStatus,
  workStatusSelectClass,
  type WorkStatus,
} from '@/lib/workStatus'

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
    <div className="mt-4 rounded-xl border border-cream bg-cream/50 px-4 py-4 sm:px-5">
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
              <div className="min-w-0">
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

function WorkStatusControl({
  leadId,
  value,
  disabled,
  onOptimistic,
  onError,
}: {
  leadId: string
  value: string | null
  disabled?: boolean
  onOptimistic: (next: WorkStatus) => void
  onError: (message: string, previous: string | null) => void
}) {
  const displayed = displayWorkStatus(value)
  const [saving, setSaving] = useState(false)

  async function handleChange(next: WorkStatus) {
    if (next === displayed || saving) return
    const previous = value
    onOptimistic(next)
    setSaving(true)

    const { error } = await supabase
      .from('leads')
      .update({ work_status: next })
      .eq('id', leadId)

    setSaving(false)

    if (error) {
      onError(error.message, previous)
    }
  }

  return (
    <select
      aria-label="Work status"
      disabled={disabled || saving}
      value={displayed}
      onChange={(e) => void handleChange(e.target.value as WorkStatus)}
      className={`w-auto min-w-[8.5rem] shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-teal/20 disabled:opacity-60 ${workStatusSelectClass(displayed)}`}
    >
      {WORK_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}

function PulseNoteField({
  leadId,
  value,
  disabled,
  onOptimistic,
  onError,
}: {
  leadId: string
  value: string | null
  disabled?: boolean
  onOptimistic: (next: string | null) => void
  onError: (message: string, previous: string | null) => void
}) {
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  async function save(nextRaw: string) {
    const next = nextRaw.trim()
    const previous = value
    const normalizedNext = next.length > 0 ? next : null
    const normalizedPrev = previous?.trim() ? previous.trim() : null

    if (normalizedNext === normalizedPrev || saving) return

    onOptimistic(normalizedNext)
    setSaving(true)

    const { error } = await supabase
      .from('leads')
      .update({ pulse_note: normalizedNext })
      .eq('id', leadId)

    setSaving(false)

    if (error) {
      onError(error.message, previous)
      setDraft(previous ?? '')
    }
  }

  function handleBlur(e: FocusEvent<HTMLTextAreaElement>) {
    void save(e.target.value)
  }

  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-teal">
        Private note
      </label>
      <textarea
        aria-label="Private working note"
        disabled={disabled || saving}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        rows={3}
        placeholder="Your working note..."
        className="w-full resize-y rounded-xl border border-navy/15 bg-cream/50 px-3 py-2.5 text-sm text-navy outline-none transition placeholder:text-navy/40 focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:opacity-60"
      />
      {saving ? <p className="mt-1 text-xs text-navy/50">Saving...</p> : null}
    </div>
  )
}

function LeadCard({
  lead,
  open,
  onToggle,
  actionError,
  onStatusChange,
  onStatusError,
  onNoteChange,
  onNoteError,
}: {
  lead: ScoredLead
  open: boolean
  onToggle: () => void
  actionError: string | null
  onStatusChange: (leadId: string, next: WorkStatus) => void
  onStatusError: (leadId: string, message: string, previous: string | null) => void
  onNoteChange: (leadId: string, next: string | null) => void
  onNoteError: (leadId: string, message: string, previous: string | null) => void
}) {
  return (
    <article className="w-full min-w-0 overflow-hidden rounded-2xl border border-teal/20 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="font-display text-2xl font-bold text-navy">{lead.score.total}</span>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${bucketBadgeClass(lead.score.bucket)}`}
          >
            {bucketLabel(lead.score.bucket)}
          </span>
        </div>
        <WorkStatusControl
          leadId={lead.id}
          value={lead.work_status}
          onOptimistic={(next) => onStatusChange(lead.id, next)}
          onError={(message, previous) => onStatusError(lead.id, message, previous)}
        />
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="font-display text-xl font-bold text-navy break-words">{cell(lead.name)}</h3>
        <p className="mt-1 break-all text-sm text-navy/70">{cell(lead.email)}</p>
        <p className="mt-2 text-xs text-navy/50">
          <span className="font-medium text-navy/60">{cell(lead.source)}</span>
          <span className="mx-2 text-navy/30">·</span>
          <span>{formatDate(lead.created_at)}</span>
        </p>
      </div>

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
            Capture notes
          </p>
          <div className="rounded-xl border border-navy/10 bg-cream/40 px-3 py-3 text-sm leading-relaxed text-navy/80 whitespace-pre-wrap break-words">
            {cell(lead.notes)}
          </div>
        </div>
        <div className="min-w-0">
          <PulseNoteField
            leadId={lead.id}
            value={lead.pulse_note}
            onOptimistic={(next) => onNoteChange(lead.id, next)}
            onError={(message, previous) => onNoteError(lead.id, message, previous)}
          />
        </div>
      </div>

      {actionError ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-teal transition hover:bg-teal/10"
        >
          Why this score?
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open ? <LeadBreakdown lead={lead} /> : null}
      </div>
    </article>
  )
}

export default function Dashboard() {
  const { userEmail, isAuthenticated, authReady } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({})
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({})
  const [hideClosed, setHideClosed] = useState(true)
  const {
    data: marketData,
    loading: marketLoading,
    unavailable: marketUnavailable,
    conditions: marketConditions,
  } = useMarketWatch()

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      setLoading(true)
      return
    }

    let cancelled = false

    async function confirmAuthedSession() {
      const {
        data: { session: current },
      } = await supabase.auth.getSession()
      if (current?.access_token) return current

      await new Promise((resolve) => setTimeout(resolve, 150))
      if (cancelled) return null

      const {
        data: { session: retry },
      } = await supabase.auth.getSession()
      return retry?.access_token ? retry : null
    }

    async function queryLeadsAndEvents() {
      return Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*'),
      ])
    }

    async function load() {
      setLoading(true)
      setError(null)

      const confirmed = await confirmAuthedSession()
      if (cancelled) return

      if (!confirmed?.access_token) {
        // Do not query as anon. Stay in loading until auth becomes ready again.
        setLoading(true)
        return
      }

      let [leadsResult, eventsResult] = await queryLeadsAndEvents()
      if (cancelled) return

      // Race guard: empty success while authed can mean JWT was not attached yet.
      if (!leadsResult.error && (leadsResult.data?.length ?? 0) === 0) {
        const again = await confirmAuthedSession()
        if (cancelled) return
        if (again?.access_token) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          if (cancelled) return
          ;[leadsResult, eventsResult] = await queryLeadsAndEvents()
          if (cancelled) return
        }
      }

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
  }, [authReady, isAuthenticated])

  const scored = scoreLeads(leads, events, marketConditions)
  const { ranked, notSales } = partitionScoredLeads(scored)
  const activeRanked = hideClosed
    ? ranked.filter((lead) => !isClosedWorkStatus(lead.work_status))
    : ranked

  function toggleOpen(id: string) {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function patchLead(leadId: string, patch: Partial<Lead>) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead)))
  }

  function clearActionError(leadId: string) {
    setActionErrors((prev) => {
      if (!prev[leadId]) return prev
      const next = { ...prev }
      delete next[leadId]
      return next
    })
  }

  function setActionError(leadId: string, message: string) {
    setActionErrors((prev) => ({ ...prev, [leadId]: message }))
  }

  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 py-12 sm:px-6 sm:py-16">
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

      <MarketWatch
        data={marketData}
        loading={marketLoading}
        unavailable={marketUnavailable}
      />

      {!loading && !error && ranked.length > 0 ? (
        <section className="mb-12 min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-navy">
                Ranked leads{' '}
                <span className="text-sm font-medium text-teal">({activeRanked.length})</span>
              </h2>
              <p className="mt-1 text-xs text-navy/60">
                Highest score first. Work status and private notes save to Pulse columns only.
              </p>
            </div>
            <label className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-navy/70">
              <input
                type="checkbox"
                checked={hideClosed}
                onChange={(e) => setHideClosed(e.target.checked)}
                className="rounded border-navy/20 text-teal focus:ring-teal/30"
              />
              Hide Won / Lost
            </label>
          </div>

          {activeRanked.length === 0 ? (
            <div className="rounded-2xl border border-teal/20 bg-white px-5 py-8 text-center shadow-card">
              <p className="text-sm text-navy/60">
                No active ranked leads. Uncheck Hide Won / Lost to see closed ones.
              </p>
            </div>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-5">
              {activeRanked.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  open={Boolean(openIds[lead.id])}
                  onToggle={() => toggleOpen(lead.id)}
                  actionError={actionErrors[lead.id] ?? null}
                  onStatusChange={(leadId, next) => {
                    clearActionError(leadId)
                    patchLead(leadId, { work_status: next })
                  }}
                  onStatusError={(leadId, message, previous) => {
                    patchLead(leadId, { work_status: previous })
                    setActionError(leadId, message)
                  }}
                  onNoteChange={(leadId, next) => {
                    clearActionError(leadId)
                    patchLead(leadId, { pulse_note: next })
                  }}
                  onNoteError={(leadId, message, previous) => {
                    patchLead(leadId, { pulse_note: previous })
                    setActionError(leadId, message)
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {!loading && !error && notSales.length > 0 ? (
        <section className="min-w-0">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-navy">
              Not sales leads{' '}
              <span className="text-sm font-medium text-muted">({notSales.length})</span>
            </h2>
            <p className="mt-1 text-xs text-navy/60">
              Careers and zero-score contacts. Excluded from the ranked work list.
            </p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-4">
            {notSales.map((lead) => (
              <article
                key={lead.id}
                className="w-full min-w-0 rounded-2xl border border-navy/10 bg-white p-5 shadow-card sm:p-6"
              >
                <h3 className="font-display text-lg font-bold text-navy break-words">
                  {cell(lead.name)}
                </h3>
                <p className="mt-1 break-all text-sm text-navy/70">{cell(lead.email)}</p>
                <p className="mt-2 text-xs text-navy/50">
                  <span className="font-medium text-navy/60">{cell(lead.source)}</span>
                  <span className="mx-2 text-navy/30">·</span>
                  <span>{formatDate(lead.created_at)}</span>
                </p>
                <div className="mt-4 min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Capture notes
                  </p>
                  <div className="rounded-xl border border-navy/10 bg-cream/40 px-3 py-3 text-sm leading-relaxed text-navy/80 whitespace-pre-wrap break-words">
                    {cell(lead.notes)}
                  </div>
                </div>
              </article>
            ))}
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

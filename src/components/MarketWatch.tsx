import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import {
  formatIndicatorDate,
  formatIndicatorValue,
  trendDirection,
  type MarketWatchPayload,
  type SeriesSnapshot,
  type TrendDirection,
} from '@/lib/marketWatch'

type IndicatorKind = 'number' | 'rate' | 'index'

type IndicatorDef = {
  key: keyof MarketWatchPayload
  label: string
  kind: IndicatorKind
}

const GROUPS: { title: string; items: IndicatorDef[] }[] = [
  {
    title: 'Construction',
    items: [
      { key: 'permits', label: 'US building permits', kind: 'number' },
      { key: 'starts', label: 'US housing starts', kind: 'number' },
      { key: 'wiPermits', label: 'WI building permits', kind: 'number' },
      { key: 'lumber', label: 'Lumber PPI', kind: 'index' },
    ],
  },
  {
    title: 'Rates',
    items: [{ key: 'mortgage', label: '30-year mortgage rate', kind: 'rate' }],
  },
  {
    title: 'Demand',
    items: [
      { key: 'businessApps', label: 'US business applications', kind: 'number' },
    ],
  },
]

function trendClass(direction: TrendDirection): string {
  if (direction === 'up') return 'text-teal'
  if (direction === 'down') return 'text-coral'
  return 'text-muted'
}

function TrendIcon({ direction }: { direction: TrendDirection }) {
  if (direction === 'up') return <ArrowUp className="h-4 w-4" aria-hidden />
  if (direction === 'down') return <ArrowDown className="h-4 w-4" aria-hidden />
  return <ArrowRight className="h-4 w-4" aria-hidden />
}

function trendLabel(direction: TrendDirection): string {
  if (direction === 'up') return 'Up vs prior'
  if (direction === 'down') return 'Down vs prior'
  if (direction === 'flat') return 'Unchanged vs prior'
  return 'Trend unavailable'
}

function IndicatorCard({
  label,
  snapshot,
  kind,
}: {
  label: string
  snapshot: SeriesSnapshot
  kind: IndicatorKind
}) {
  const direction = trendDirection(snapshot)
  const hasError = Boolean(snapshot.error) || snapshot.value === null

  return (
    <article className="min-w-0 rounded-2xl border border-teal/20 bg-white p-4 shadow-card sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{label}</p>
      {hasError ? (
        <p className="mt-3 text-sm text-navy/60">{snapshot.error ?? 'No data'}</p>
      ) : (
        <>
          <div className="mt-3 flex items-end justify-between gap-3">
            <p className="font-display text-2xl font-bold text-navy sm:text-3xl">
              {formatIndicatorValue(snapshot.value, kind)}
            </p>
            <div className={`inline-flex items-center gap-1 text-sm font-semibold ${trendClass(direction)}`}>
              <TrendIcon direction={direction} />
              <span className="sr-only">{trendLabel(direction)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-navy/50">{formatIndicatorDate(snapshot.date)}</p>
          {snapshot.prevValue !== null ? (
            <p className="mt-1 text-xs text-navy/45">
              Prior {formatIndicatorValue(snapshot.prevValue, kind)}
            </p>
          ) : null}
        </>
      )}
    </article>
  )
}

export default function MarketWatch() {
  const [data, setData] = useState<MarketWatchPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setUnavailable(false)

      try {
        const response = await fetch('/api/market-watch')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const payload = (await response.json()) as MarketWatchPayload
        if (cancelled) return
        setData(payload)
      } catch {
        if (cancelled) return
        setData(null)
        setUnavailable(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mb-12 min-w-0">
      <div className="mb-5">
        <p className="section-label mb-2">Market Watch</p>
        <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">US and Wisconsin pulse</h2>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          Latest FRED readings with direction vs the prior observation. Direction only, not a good/bad judgment.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[8rem] items-center justify-center rounded-2xl border border-teal/20 bg-white shadow-card">
          <div className="flex items-center gap-3 text-sm text-navy/60" role="status">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-teal/30 border-t-teal"
              aria-hidden
            />
            Loading market data...
          </div>
        </div>
      ) : null}

      {!loading && unavailable ? (
        <div
          className="rounded-2xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-navy"
          role="alert"
        >
          <p className="font-semibold text-coral">Market data unavailable</p>
          <p className="mt-1 text-navy/70">
            Could not reach the market-watch function. Use netlify dev locally so /api/market-watch is served.
          </p>
        </div>
      ) : null}

      {!loading && !unavailable && data ? (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="mb-3 font-display text-lg font-semibold text-navy">{group.title}</h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {group.items.map((item) => (
                  <IndicatorCard
                    key={item.key}
                    label={item.label}
                    snapshot={data[item.key]}
                    kind={item.kind}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

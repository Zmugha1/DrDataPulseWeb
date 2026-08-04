export type SeriesSnapshot = {
  value: number | null
  date: string | null
  prevValue: number | null
  error?: string
}

export type MarketWatchPayload = {
  permits: SeriesSnapshot
  starts: SeriesSnapshot
  mortgage: SeriesSnapshot
  lumber: SeriesSnapshot
  wiPermits: SeriesSnapshot
  businessApps: SeriesSnapshot
}

export type TrendDirection = 'up' | 'down' | 'flat' | 'unknown'

/** Compact market flags for scoring. Null means market data unavailable. */
export type MarketConditions = {
  wiPermitsUp: boolean
  startsUp: boolean
  mortgageDown: boolean
}

export function trendDirection(snapshot: SeriesSnapshot): TrendDirection {
  if (snapshot.value === null || snapshot.prevValue === null) return 'unknown'
  if (snapshot.value > snapshot.prevValue) return 'up'
  if (snapshot.value < snapshot.prevValue) return 'down'
  return 'flat'
}

/**
 * Derive scoring flags from FRED snapshots. Returns null if payload is missing
 * or required series cannot be compared (so scoring skips market nudges).
 */
export function deriveMarketConditions(
  payload: MarketWatchPayload | null | undefined,
): MarketConditions | null {
  if (!payload) return null

  const wi = trendDirection(payload.wiPermits)
  const starts = trendDirection(payload.starts)
  const mortgage = trendDirection(payload.mortgage)

  if (wi === 'unknown' && starts === 'unknown' && mortgage === 'unknown') {
    return null
  }

  return {
    wiPermitsUp: wi === 'up',
    startsUp: starts === 'up',
    mortgageDown: mortgage === 'down',
  }
}

export function formatIndicatorValue(
  value: number | null,
  kind: 'number' | 'rate' | 'index' = 'number',
): string {
  if (value === null || !Number.isFinite(value)) return '-'
  if (kind === 'rate') {
    return `${value.toFixed(2)}%`
  }
  if (kind === 'index') {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
}

export function formatIndicatorDate(value: string | null): string {
  if (!value) return '-'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

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

export function trendDirection(snapshot: SeriesSnapshot): TrendDirection {
  if (snapshot.value === null || snapshot.prevValue === null) return 'unknown'
  if (snapshot.value > snapshot.prevValue) return 'up'
  if (snapshot.value < snapshot.prevValue) return 'down'
  return 'flat'
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

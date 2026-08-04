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

type FredObservation = {
  date?: string
  value?: string
}

type FredObservationsResponse = {
  observations?: FredObservation[]
  error_code?: number
  error_message?: string
}

const SERIES = {
  permits: 'PERMIT',
  starts: 'HOUST',
  mortgage: 'MORTGAGE30US',
  lumber: 'WPU081',
  wiPermits: 'WIBPPRIV',
  businessApps: 'BABATOTALSAUS',
} as const

function parseNumeric(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) return null
  const trimmed = String(raw).trim()
  if (!trimmed || trimmed === '.') return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

async function fetchSeriesSnapshot(
  seriesId: string,
  apiKey: string,
): Promise<SeriesSnapshot> {
  const url = new URL('https://api.stlouisfed.org/fred/series/observations')
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('file_type', 'json')
  url.searchParams.set('sort_order', 'desc')
  url.searchParams.set('limit', '13')

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      return {
        value: null,
        date: null,
        prevValue: null,
        error: `HTTP ${response.status} for ${seriesId}`,
      }
    }

    const data = (await response.json()) as FredObservationsResponse

    if (data.error_message) {
      return {
        value: null,
        date: null,
        prevValue: null,
        error: `${seriesId}: ${data.error_message}`,
      }
    }

    const observations = (data.observations ?? []).filter(
      (row) => parseNumeric(row.value) !== null,
    )

    if (observations.length === 0) {
      return {
        value: null,
        date: null,
        prevValue: null,
        error: `${seriesId}: no observations returned`,
      }
    }

    const latest = observations[0]
    const previous = observations[1]

    return {
      value: parseNumeric(latest?.value),
      date: latest?.date ?? null,
      prevValue: parseNumeric(previous?.value),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error'
    return {
      value: null,
      date: null,
      prevValue: null,
      error: `${seriesId}: ${message}`,
    }
  }
}

export async function buildMarketWatchPayload(apiKey: string): Promise<MarketWatchPayload> {
  const [permits, starts, mortgage, lumber, wiPermits, businessApps] = await Promise.all([
    fetchSeriesSnapshot(SERIES.permits, apiKey),
    fetchSeriesSnapshot(SERIES.starts, apiKey),
    fetchSeriesSnapshot(SERIES.mortgage, apiKey),
    fetchSeriesSnapshot(SERIES.lumber, apiKey),
    fetchSeriesSnapshot(SERIES.wiPermits, apiKey),
    fetchSeriesSnapshot(SERIES.businessApps, apiKey),
  ])

  return { permits, starts, mortgage, lumber, wiPermits, businessApps }
}

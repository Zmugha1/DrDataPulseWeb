import { useEffect, useState } from 'react'
import {
  deriveMarketConditions,
  type MarketConditions,
  type MarketWatchPayload,
} from '@/lib/marketWatch'

export function useMarketWatch(): {
  data: MarketWatchPayload | null
  loading: boolean
  unavailable: boolean
  conditions: MarketConditions | null
} {
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

  return {
    data,
    loading,
    unavailable,
    conditions: unavailable ? null : deriveMarketConditions(data),
  }
}

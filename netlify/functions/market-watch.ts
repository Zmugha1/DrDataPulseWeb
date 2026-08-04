import type { Handler } from '@netlify/functions'
import { buildMarketWatchPayload } from './lib/fredMarketWatch'

export const handler: Handler = async () => {
  const apiKey = process.env.FRED_API_KEY?.trim()

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'FRED_API_KEY is not configured on the server.',
      }),
    }
  }

  const payload = await buildMarketWatchPayload(apiKey)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
    body: JSON.stringify(payload),
  }
}

/**
 * Local smoke test for FRED market-watch data (no Netlify UI).
 * Usage: npx tsx scripts/test-market-watch.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildMarketWatchPayload } from '../netlify/functions/lib/fredMarketWatch'

function loadDotEnv(filePath: string) {
  try {
    const text = readFileSync(filePath, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!(key in process.env) || !process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // ignore missing .env
  }
}

loadDotEnv(resolve(process.cwd(), '.env'))

const apiKey = process.env.FRED_API_KEY?.trim()
if (!apiKey) {
  console.error('Missing FRED_API_KEY in .env. Paste the key, then re-run.')
  process.exit(1)
}

const payload = await buildMarketWatchPayload(apiKey)
console.log(JSON.stringify(payload, null, 2))

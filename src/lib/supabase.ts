import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// TEMPORARY deploy diagnostic (remove after Netlify env is confirmed).
console.log(
  'SUPABASE_URL present:',
  !!supabaseUrl,
  'startsWithHttps:',
  String(supabaseUrl).startsWith('https://'),
  'length:',
  String(supabaseUrl).length,
  'ANON_KEY present:',
  !!supabaseAnonKey,
  'ANON_KEY length:',
  supabaseAnonKey ? String(supabaseAnonKey).length : 0,
)

function paintBootError(message: string) {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#F5EDD8;color:#1E2A3A;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:36rem;background:#fff;border:1px solid rgba(30,42,58,0.12);border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#2DD4BF;">Pulse boot error</p>
        <h1 style="margin:0 0 12px;font-size:1.35rem;font-weight:700;">Supabase env not usable in this build</h1>
        <p style="margin:0;line-height:1.5;color:rgba(30,42,58,0.75);">${message}</p>
        <p style="margin:16px 0 0;font-size:12px;color:rgba(30,42,58,0.55);">Temporary diagnostic. Check Netlify env names VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then trigger a new deploy/build.</p>
      </div>
    </div>
  `
}

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    const message =
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the Vite build. Netlify must set both before npm run build.'
    paintBootError(message)
    throw new Error(message)
  }

  if (!String(supabaseUrl).startsWith('https://')) {
    const message = `VITE_SUPABASE_URL is present (length ${String(supabaseUrl).length}) but does not start with https://. Check for quotes, spaces, or a wrong value in Netlify.`
    paintBootError(message)
    throw new Error(message)
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown createClient error'
    const message = `createClient failed: ${detail}. URL present=${Boolean(supabaseUrl)}, startsWithHttps=${String(supabaseUrl).startsWith('https://')}, length=${String(supabaseUrl).length}.`
    paintBootError(message)
    throw new Error(message)
  }
}

export const supabase = createSupabaseClient()

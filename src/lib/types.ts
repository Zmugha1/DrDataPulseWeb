export type Lead = {
  id: string
  name: string | null
  email: string | null
  source: string | null
  stage: string | null
  notes: string | null
  work_status: string | null
  pulse_note: string | null
  created_at: string
}

export type LeadEvent = {
  id: string
  lead_id: string | null
  event_type: string | null
  payload: Record<string, unknown> | null
  created_at: string
  [key: string]: unknown
}

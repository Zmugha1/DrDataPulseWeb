export type WorkStatus = 'New' | 'Contacted' | 'Nurturing' | 'Booked' | 'Won' | 'Lost'

export const WORK_STATUSES: WorkStatus[] = [
  'New',
  'Contacted',
  'Nurturing',
  'Booked',
  'Won',
  'Lost',
]

export function displayWorkStatus(value: string | null | undefined): WorkStatus {
  if (!value) return 'New'
  if ((WORK_STATUSES as string[]).includes(value)) return value as WorkStatus
  return 'New'
}

export function workStatusSelectClass(status: WorkStatus): string {
  if (status === 'Won') return 'border-teal/40 bg-teal/10 text-teal'
  if (status === 'Lost') return 'border-navy/10 bg-muted/15 text-muted'
  if (status === 'Nurturing') return 'border-coral/30 bg-coral/10 text-coral'
  if (status === 'Contacted' || status === 'Booked') return 'border-navy/20 bg-white text-navy'
  return 'border-navy/15 bg-cream/60 text-navy'
}

export function isClosedWorkStatus(value: string | null | undefined): boolean {
  const status = displayWorkStatus(value)
  return status === 'Won' || status === 'Lost'
}

import type { MarketConditions } from '@/lib/marketWatch'
import type { ScoredLead } from '@/lib/scoring'
import { displayWorkStatus, isClosedWorkStatus } from '@/lib/workStatus'

export type MorningBriefStats = {
  hotOpenCount: number
  nurturingCount: number
  newSinceYesterdayCount: number
  marketLine: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

export function countHotOpenLeads(scored: ScoredLead[]): number {
  return scored.filter(
    (lead) => lead.score.bucket === 'HOT' && !isClosedWorkStatus(lead.work_status),
  ).length
}

export function countNurturingLeads(scored: ScoredLead[]): number {
  return scored.filter((lead) => displayWorkStatus(lead.work_status) === 'Nurturing').length
}

export function countNewSinceYesterday(
  scored: ScoredLead[],
  nowMs: number = Date.now(),
): number {
  const cutoff = nowMs - DAY_MS
  return scored.filter((lead) => {
    const created = new Date(lead.created_at).getTime()
    if (Number.isNaN(created)) return false
    return created >= cutoff
  }).length
}

export function marketBriefLine(market: MarketConditions | null): string | null {
  if (!market) return null
  if (market.wiPermitsUp) {
    return 'Wisconsin construction demand is rising. Good day to push builder leads.'
  }
  if (market.mortgageDown || market.startsUp) {
    return 'Real estate conditions are favorable today.'
  }
  return 'Market conditions are steady.'
}

export function buildMorningBrief(
  scored: ScoredLead[],
  market: MarketConditions | null,
  nowMs: number = Date.now(),
): MorningBriefStats {
  return {
    hotOpenCount: countHotOpenLeads(scored),
    nurturingCount: countNurturingLeads(scored),
    newSinceYesterdayCount: countNewSinceYesterday(scored, nowMs),
    marketLine: marketBriefLine(market),
  }
}

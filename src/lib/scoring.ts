import type { MarketConditions } from '@/lib/marketWatch'
import type { Lead, LeadEvent } from '@/lib/types'

export type ScoreLine = {
  signal: string
  reason: string
  points: number
}

export type ScoreBucket = 'HOT' | 'WARM' | 'COOL' | 'NOT_SALES'

export type LeadScore = {
  total: number
  bucket: ScoreBucket
  lines: ScoreLine[]
  isCareers: boolean
  excludeFromRanked: boolean
}

export type ScoredLead = Lead & {
  score: LeadScore
}

const BUILDER_TERMS = [
  'bid',
  'quote',
  'estimate',
  'permit',
  'contractor',
  'construction',
  'trade',
]

const ADVISOR_TERMS = ['coach', 'client', 'consult', 'session', 'practice']

const GROWTH_TERMS = [
  'listing',
  'buyer',
  'seller',
  'property',
  'real estate',
  'agent',
  'lead',
]

function normalizeEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase()
  return trimmed ? trimmed : null
}

function parseNeeds(notes: string | null | undefined): string | null {
  if (!notes) return null
  const match = notes.match(/Needs:\s*(.*?)(?:\n|$)/i)
  if (!match) return null
  const value = match[1]?.trim() ?? ''
  if (!value) return null
  if (/^n\/?a\.?$/i.test(value)) return null
  return value
}

function hasTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

function hasAnyTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => hasTerm(text, term))
}

function hasPhone(notes: string | null | undefined): boolean {
  if (!notes) return false
  return /Phone:\s*[^\n]*\d/i.test(notes)
}

function bucketForScore(total: number, isCareers: boolean): ScoreBucket {
  if (isCareers || total === 0) return 'NOT_SALES'
  if (total >= 70) return 'HOT'
  if (total >= 40) return 'WARM'
  return 'COOL'
}

function sourceWarmth(source: string | null | undefined): ScoreLine | null {
  const key = source?.trim().toLowerCase() ?? ''
  if (key === 'card_capture') {
    return {
      signal: 'Source warmth',
      reason: 'Met in person, shared their details',
      points: 40,
    }
  }
  if (key === 'find_your_zone') {
    return {
      signal: 'Source warmth',
      reason: 'Took the assessment quiz',
      points: 30,
    }
  }
  if (key === 'products_page') {
    return {
      signal: 'Source warmth',
      reason: 'Asked about a specific product',
      points: 25,
    }
  }
  if (key === 'lead_magnet' || key === 'leadership_training') {
    return {
      signal: 'Source warmth',
      reason: 'Downloaded a guide',
      points: 15,
    }
  }
  return null
}

/**
 * Deterministic lead score from lead + events + optional market conditions.
 * Pure function. No API calls.
 */
export function scoreLead(
  lead: Lead,
  allLeads: Lead[],
  events: LeadEvent[],
  market: MarketConditions | null = null,
): LeadScore {
  const source = lead.source?.trim().toLowerCase() ?? ''
  const isCareers = source === 'careers_page'

  if (isCareers) {
    return {
      total: 0,
      bucket: 'NOT_SALES',
      lines: [
        {
          signal: 'Source',
          reason: 'Not a sales lead',
          points: 0,
        },
      ],
      isCareers: true,
      excludeFromRanked: true,
    }
  }

  const lines: ScoreLine[] = []

  const warmth = sourceWarmth(lead.source)
  if (warmth) lines.push(warmth)

  const needs = parseNeeds(lead.notes)
  if (needs) {
    lines.push({
      signal: 'Stated intent',
      reason: 'Wrote a specific need',
      points: 25,
    })
  }

  const verticalText = [lead.notes ?? '', needs ?? ''].join(' ')
  const matchesBuilder = hasAnyTerm(verticalText, BUILDER_TERMS)
  const matchesAdvisor = hasAnyTerm(verticalText, ADVISOR_TERMS)
  const matchesGrowth = hasAnyTerm(verticalText, GROWTH_TERMS)

  if (matchesBuilder) {
    lines.push({
      signal: 'Vertical fit',
      reason: 'Matches Builder Suite',
      points: 15,
    })
  }
  if (matchesAdvisor) {
    lines.push({
      signal: 'Vertical fit',
      reason: 'Matches Advisor Suite',
      points: 15,
    })
  }
  if (matchesGrowth) {
    lines.push({
      signal: 'Vertical fit',
      reason: 'Matches Growth Suite',
      points: 15,
    })
  }

  const email = normalizeEmail(lead.email)
  const emailCount = email
    ? allLeads.filter((item) => normalizeEmail(item.email) === email).length
    : 0
  const eventCount = events.filter((event) => event.lead_id === lead.id).length
  if (emailCount >= 2 || eventCount >= 2) {
    lines.push({
      signal: 'Multi-touch',
      reason: 'Engaged more than once',
      points: 20,
    })
  }

  if (hasPhone(lead.notes)) {
    lines.push({
      signal: 'Contactability',
      reason: 'Has phone number',
      points: 5,
    })
  }

  if (market) {
    if (matchesBuilder && market.wiPermitsUp) {
      lines.push({
        signal: 'Market conditions',
        reason: 'Wisconsin construction demand rising',
        points: 8,
      })
    }
    if (matchesGrowth && (market.mortgageDown || market.startsUp)) {
      lines.push({
        signal: 'Market conditions',
        reason: 'Real estate conditions favorable',
        points: 8,
      })
    }
  }

  const total = lines.reduce((sum, line) => sum + line.points, 0)
  const bucket = bucketForScore(total, false)

  return {
    total,
    bucket,
    lines,
    isCareers: false,
    excludeFromRanked: bucket === 'NOT_SALES',
  }
}

export function scoreLeads(
  leads: Lead[],
  events: LeadEvent[],
  market: MarketConditions | null = null,
): ScoredLead[] {
  return leads.map((lead) => ({
    ...lead,
    score: scoreLead(lead, leads, events, market),
  }))
}

export function partitionScoredLeads(scored: ScoredLead[]): {
  ranked: ScoredLead[]
  notSales: ScoredLead[]
} {
  const ranked: ScoredLead[] = []
  const notSales: ScoredLead[] = []

  for (const lead of scored) {
    if (lead.score.excludeFromRanked) {
      notSales.push(lead)
    } else {
      ranked.push(lead)
    }
  }

  ranked.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total
    return b.created_at.localeCompare(a.created_at)
  })

  notSales.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return { ranked, notSales }
}

import type { MorningBriefStats } from '@/lib/morningBrief'

type MorningBriefProps = {
  stats: MorningBriefStats
  leadsLoading?: boolean
  onJumpToHot?: () => void
}

export default function MorningBrief({ stats, leadsLoading, onJumpToHot }: MorningBriefProps) {
  const { hotOpenCount, nurturingCount, newSinceYesterdayCount, marketLine } = stats

  return (
    <section className="mb-10 min-w-0">
      <div className="mb-4">
        <p className="section-label mb-2">Morning Brief</p>
        <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">Your day</h2>
      </div>

      <div className="rounded-2xl border border-teal/20 bg-white p-5 shadow-card sm:p-6">
        {leadsLoading ? (
          <p className="text-sm text-navy/60">Loading your brief...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-navy sm:text-lg">
                {hotOpenCount > 0 ? (
                  <>
                    You have{' '}
                    <span className="font-display font-bold text-coral">{hotOpenCount}</span>{' '}
                    {hotOpenCount === 1 ? 'lead' : 'leads'} to work today
                  </>
                ) : (
                  <span className="text-navy/80">
                    No hot leads right now, keep the pipeline filling.
                  </span>
                )}
              </p>
              {hotOpenCount > 0 && onJumpToHot ? (
                <button type="button" onClick={onJumpToHot} className="btn-secondary !px-3 !py-2 text-xs">
                  Jump to hot leads
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {nurturingCount > 0 ? (
                <div className="rounded-xl border border-coral/20 bg-coral/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">
                    Nurturing
                  </p>
                  <p className="mt-1 text-sm text-navy">
                    <span className="font-display font-bold">{nurturingCount}</span>{' '}
                    {nurturingCount === 1 ? 'lead' : 'leads'} in Nurturing need a follow-up.
                  </p>
                </div>
              ) : null}

              {newSinceYesterdayCount > 0 ? (
                <div className="rounded-xl border border-teal/20 bg-teal/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">New</p>
                  <p className="mt-1 text-sm text-navy">
                    <span className="font-display font-bold">{newSinceYesterdayCount}</span> new{' '}
                    {newSinceYesterdayCount === 1 ? 'lead' : 'leads'} since yesterday.
                  </p>
                </div>
              ) : null}
            </div>

            {marketLine ? (
              <p className="border-t border-cream pt-4 text-sm leading-relaxed text-navy/75">
                {marketLine}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

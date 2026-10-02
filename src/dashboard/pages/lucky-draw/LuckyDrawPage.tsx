import CosmicLuckyDraw from './CosmicLuckyDraw'

/**
 * Dashboard route wrapper for the Cosmic Lucky Draw.
 *
 * The dashboard <main> applies p-4/lg:p-6 padding; we negate it with negative
 * margins so the draw renders full-bleed.
 *
 * Mobile-first: the stage flows naturally (min-height) so the stacked
 * viewport + config panel can scroll instead of being crammed into one
 * screen. From `lg` up it locks to the viewport height minus the top bar
 * for the fixed split-screen layout.
 */
export function LuckyDrawPage() {
  return (
    <div className="-m-4 lg:-m-6 min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:min-h-0">
      <CosmicLuckyDraw />
    </div>
  )
}

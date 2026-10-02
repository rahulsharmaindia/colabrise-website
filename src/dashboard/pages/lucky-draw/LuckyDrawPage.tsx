import CosmicLuckyDraw from './CosmicLuckyDraw'

/**
 * Dashboard route wrapper for the Cosmic Lucky Draw.
 *
 * The dashboard <main> applies p-4/lg:p-6 padding; we negate it with negative
 * margins so the draw renders full-bleed, and size the stage to the viewport
 * height minus the top bar so the canvas never overflows the page.
 */
export function LuckyDrawPage() {
  return (
    <div className="-m-4 lg:-m-6 h-[calc(100vh-4rem)]">
      <CosmicLuckyDraw />
    </div>
  )
}

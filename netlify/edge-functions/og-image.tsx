/** @jsxImportSource https://esm.sh/react@18.2.0 */
/**
 * Netlify Edge Function — dynamic OG card image (1200x630 PNG).
 *
 * Uses og_edge, the Deno port of @vercel/og. Runs on Netlify's Deno
 * edge runtime.
 *
 * Route (via netlify.toml): /api/og-image
 */

import { ImageResponse } from 'https://deno.land/x/og_edge@0.0.6/mod.ts'

export default function handler(request: Request) {
  const url = new URL(request.url)
  const p = url.searchParams

  const title = p.get('t') || 'Campaign on Colabrise'
  const brand = p.get('b') || ''
  const budget = p.get('p') || ''
  const niche = p.get('n') || ''
  const paymentModel = p.get('pm') || 'Fixed'
  const deliverables = p.get('dl') || ''
  const followers = p.get('f') || ''
  const fit = p.get('ft') || ''
  const daysLeft = p.get('days') || ''
  const applied = p.get('app') || '0'

  const formattedBudget = budget
    ? `\u20B9 ${Number(budget).toLocaleString('en-IN')}`
    : ''

  const brandInitials = brand
    ? brand.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f0f1a',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #a855f7, #6366f1)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', padding: '56px 64px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '36px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: '34px', fontWeight: 800 }}>{brandInitials}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {brand && (
                <span style={{ color: '#a78bfa', fontSize: '26px', fontWeight: 500, marginBottom: '6px' }}>{brand}</span>
              )}
              <span style={{ color: 'white', fontSize: '44px', fontWeight: 700, lineHeight: 1.15 }}>
                {title.length > 38 ? title.slice(0, 38) + '...' : title}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '36px', flexWrap: 'wrap' }}>
            {deliverables && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.15)', border: '2px solid rgba(168, 85, 247, 0.4)' }}>
                <span style={{ color: '#c084fc', fontSize: '26px', fontWeight: 600 }}>{deliverables}</span>
              </div>
            )}
            {followers && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.15)', border: '2px solid rgba(59, 130, 246, 0.4)' }}>
                <span style={{ color: '#60a5fa', fontSize: '26px', fontWeight: 600 }}>{followers} followers</span>
              </div>
            )}
            {fit && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)' }}>
                <span style={{ color: '#34d399', fontSize: '26px', fontWeight: 600 }}>{fit} fit</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {daysLeft && (
              <span style={{ color: '#94a3b8', fontSize: '26px', fontWeight: 500 }}>{daysLeft}d left</span>
            )}
            <span style={{ color: '#94a3b8', fontSize: '26px', fontWeight: 500 }}>{applied} applied</span>
            {niche && (
              <div style={{ display: 'flex', padding: '8px 18px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ color: '#f87171', fontSize: '24px', fontWeight: 600 }}>{niche}</span>
              </div>
            )}
            {formattedBudget && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginLeft: 'auto' }}>
                <span style={{ color: 'white', fontSize: '40px', fontWeight: 700 }}>{formattedBudget}</span>
                <span style={{ color: '#64748b', fontSize: '24px' }}>/{paymentModel}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '64px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: '13px', fontWeight: 800 }}>C</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>Colabrise</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

export const config = { path: '/api/og-image' }

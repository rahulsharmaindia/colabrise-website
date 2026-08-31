/** @jsxImportSource https://esm.sh/react@18.2.0 */
/**
 * Netlify Edge Function — dynamic OG card image (1200x630 PNG).
 *
 * Uses og_edge (Deno port of @vercel/og). Follows the official
 * ascorbic/og-edge usage: import React, async handler, JSX element.
 *
 * Route (via netlify.toml): /api/og-image
 */

import React from 'https://esm.sh/react@18.2.0'
import { ImageResponse } from 'https://deno.land/x/og_edge/mod.ts'

// Keep the React import referenced so the JSX transform + bundler retain it.
void React

export default async function handler(request: Request) {
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

  const formattedBudget = budget ? `\u20B9 ${Number(budget).toLocaleString('en-IN')}` : ''
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
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #f59e0b, #a855f7, #6366f1)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', padding: '56px 64px', width: '100%', height: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '36px' }}>
            <div style={{ display: 'flex', width: '80px', height: '80px', borderRadius: '20px', marginRight: '24px', background: '#6d28d9', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '34px', fontWeight: 700 }}>{brandInitials}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {brand ? <span style={{ color: '#a78bfa', fontSize: '26px', marginBottom: '6px' }}>{brand}</span> : <span />}
              <span style={{ color: 'white', fontSize: '44px', fontWeight: 700 }}>
                {title.length > 38 ? title.slice(0, 38) + '...' : title}
              </span>
            </div>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', marginBottom: '36px' }}>
            {deliverables ? (
              <div style={{ display: 'flex', marginRight: '16px', padding: '14px 24px', borderRadius: '16px', background: 'rgba(168,85,247,0.15)', border: '2px solid rgba(168,85,247,0.4)' }}>
                <span style={{ color: '#c084fc', fontSize: '26px' }}>{deliverables}</span>
              </div>
            ) : <span />}
            {followers ? (
              <div style={{ display: 'flex', marginRight: '16px', padding: '14px 24px', borderRadius: '16px', background: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.4)' }}>
                <span style={{ color: '#60a5fa', fontSize: '26px' }}>{followers} followers</span>
              </div>
            ) : <span />}
            {fit ? (
              <div style={{ display: 'flex', padding: '14px 24px', borderRadius: '16px', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <span style={{ color: '#34d399', fontSize: '26px' }}>{fit} fit</span>
              </div>
            ) : <span />}
          </div>

          <div style={{ display: 'flex', flex: 1 }} />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {daysLeft ? <span style={{ color: '#94a3b8', fontSize: '26px', marginRight: '28px' }}>{daysLeft}d left</span> : <span />}
            <span style={{ color: '#94a3b8', fontSize: '26px', marginRight: '28px' }}>{applied} applied</span>
            {niche ? (
              <div style={{ display: 'flex', padding: '8px 18px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <span style={{ color: '#f87171', fontSize: '24px' }}>{niche}</span>
              </div>
            ) : <span />}
            {formattedBudget ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
                <span style={{ color: 'white', fontSize: '40px', fontWeight: 700 }}>{formattedBudget}</span>
                <span style={{ color: '#64748b', fontSize: '24px', marginLeft: '8px' }}>/{paymentModel}</span>
              </div>
            ) : <span />}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

export const config = { path: '/api/og-image' }

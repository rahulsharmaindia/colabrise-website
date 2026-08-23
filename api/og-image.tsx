import { ImageResponse } from '@vercel/og'
import type { VercelRequest } from '@vercel/node'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const title = url.searchParams.get('t') || 'Campaign on Colabrise'
  const brand = url.searchParams.get('b') || ''
  const description = url.searchParams.get('d') || ''
  const budget = url.searchParams.get('p') || ''
  const niche = url.searchParams.get('n') || ''

  const formattedBudget = budget
    ? `\u20B9${Number(budget).toLocaleString('en-IN')}`
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '60px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Top bar accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #a855f7, #6366f1, #06b6d4)',
          }}
        />

        {/* Logo + site name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>C</span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 500 }}>Colabrise</span>
        </div>

        {/* Brand name */}
        {brand && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#a855f7', fontSize: '14px', fontWeight: 700 }}>
                {brand.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 500 }}>{brand}</span>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            color: 'white',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: '0 0 20px 0',
            maxWidth: '900px',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            style={{
              color: '#cbd5e1',
              fontSize: '22px',
              lineHeight: 1.5,
              margin: '0 0 32px 0',
              maxWidth: '800px',
            }}
          >
            {description.length > 100 ? description.slice(0, 100) + '...' : description}
          </p>
        )}

        {/* Bottom info pills */}
        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          {formattedBudget && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span style={{ color: '#34d399', fontSize: '18px', fontWeight: 600 }}>
                {formattedBudget}/creator
              </span>
            </div>
          )}
          {niche && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <span style={{ color: '#c084fc', fontSize: '18px', fontWeight: 600 }}>{niche}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <span style={{ color: '#a5b4fc', fontSize: '18px', fontWeight: 600 }}>Open to Apply</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

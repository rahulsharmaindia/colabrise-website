/**
 * Netlify Edge Function — dynamic OG card image (PNG).
 *
 * Builds the card as an SVG string (no font/WASM crashes there), then
 * rasterizes it to PNG with @resvg/resvg-wasm — a stable WASM renderer.
 * WhatsApp/Facebook only reliably accept PNG/JPEG for og:image, so SVG
 * alone is not enough.
 *
 * Route (via netlify.toml): /api/og-image
 */

import { initWasm, Resvg } from 'https://esm.sh/@resvg/resvg-wasm@2.6.2'

// Initialize the WASM module once per edge instance (module scope).
let wasmReady: Promise<void> | null = null
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(
      fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm'),
    )
  }
  return wasmReady
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim())
      current = word
      if (lines.length >= maxLines - 1) break
    } else {
      current = (current + ' ' + word).trim()
    }
  }
  if (current && lines.length < maxLines) lines.push(current.trim())
  return lines
}

function buildSvg(p: URLSearchParams): string {
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

  const formattedBudget = budget ? `\u20B9${Number(budget).toLocaleString('en-IN')}` : ''
  const brandInitials = brand
    ? brand.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  const titleLines = wrapText(title, 26, 2)

  const pills: { label: string; color: string; bg: string; border: string }[] = []
  if (deliverables) pills.push({ label: deliverables, color: '#c084fc', bg: '#2a1a45', border: '#7c3aed' })
  if (followers) pills.push({ label: `${followers} followers`, color: '#60a5fa', bg: '#14243f', border: '#2563eb' })
  if (fit) pills.push({ label: `${fit} fit`, color: '#34d399', bg: '#0f2e26', border: '#059669' })

  let pillX = 64
  const pillY = 260 + (titleLines.length - 1) * 52
  const pillSvg = pills
    .map((pill) => {
      const w = pill.label.length * 15 + 48
      const rect = `<rect x="${pillX}" y="${pillY}" width="${w}" height="52" rx="16" fill="${pill.bg}" stroke="${pill.border}" stroke-width="2"/>`
      const text = `<text x="${pillX + 24}" y="${pillY + 34}" font-size="26" font-weight="600" fill="${pill.color}" font-family="sans-serif">${esc(pill.label)}</text>`
      pillX += w + 16
      return rect + text
    })
    .join('')

  const footerY = 560
  let footerX = 64
  const footerParts: string[] = []
  if (daysLeft) {
    footerParts.push(`<text x="${footerX}" y="${footerY}" font-size="26" fill="#94a3b8" font-family="sans-serif">${esc(daysLeft)}d left</text>`)
    footerX += daysLeft.length * 16 + 90
  }
  footerParts.push(`<text x="${footerX}" y="${footerY}" font-size="26" fill="#94a3b8" font-family="sans-serif">${esc(applied)} applied</text>`)
  footerX += String(applied).length * 16 + 110
  if (niche) {
    const nw = niche.length * 15 + 36
    footerParts.push(`<rect x="${footerX}" y="${footerY - 30}" width="${nw}" height="40" rx="10" fill="#3a1414" stroke="#dc2626"/>`)
    footerParts.push(`<text x="${footerX + 18}" y="${footerY}" font-size="24" font-weight="600" fill="#f87171" font-family="sans-serif">${esc(niche)}</text>`)
  }
  const budgetSvg = formattedBudget
    ? `<text x="1136" y="${footerY}" font-size="40" font-weight="700" fill="#ffffff" text-anchor="end" font-family="sans-serif">${esc(formattedBudget)}</text>
       <text x="1136" y="${footerY + 30}" font-size="22" fill="#64748b" text-anchor="end" font-family="sans-serif">/${esc(paymentModel)}</text>`
    : ''

  const titleSvg = titleLines
    .map((line, i) => `<text x="168" y="${175 + i * 52}" font-size="44" font-weight="700" fill="#ffffff" font-family="sans-serif">${esc(line)}</text>`)
    .join('')

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0f0f1a"/>
  <rect width="1200" height="6" fill="url(#bar)"/>
  <rect x="64" y="96" width="80" height="80" rx="20" fill="url(#avatar)"/>
  <text x="104" y="150" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${esc(brandInitials)}</text>
  ${brand ? `<text x="168" y="122" font-size="26" fill="#a78bfa" font-family="sans-serif">${esc(brand)}</text>` : ''}
  ${titleSvg}
  ${pillSvg}
  ${footerParts.join('\n  ')}
  ${budgetSvg}
  <rect x="64" y="592" width="22" height="22" rx="6" fill="url(#avatar)"/>
  <text x="94" y="608" font-size="18" fill="#64748b" font-family="sans-serif">Colabrise</text>
</svg>`
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const svg = buildSvg(url.searchParams)

  try {
    await ensureWasm()
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { loadSystemFonts: false },
    })
    const pngData = resvg.render().asPng()

    return new Response(pngData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (_err) {
    // Fallback to SVG if rasterization fails — at least the browser shows it
    return new Response(svg, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
    })
  }
}

export const config = { path: '/api/og-image' }

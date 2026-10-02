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

// resvg-wasm runs in an isolated sandbox with NO system fonts available.
// Without a font buffer, every <text> glyph renders as an empty .notdef box
// (the "boxes but no values" bug). We fetch real TTF buffers once per edge
// instance and hand them to resvg via `fontBuffers`.
//
// Roboto Regular + Bold are served as raw TTF bytes (resvg needs TTF/OTF — not
// the CSS that fonts.googleapis.com returns, nor the woff2 that @fontsource
// ships). The internal font family name in these files is exactly "Roboto",
// which must match `sansSerifFamily`/`defaultFontFamily` below for resvg to
// resolve glyphs — otherwise every <text> renders as an invisible .notdef box.
//
// Each weight lists multiple mirrors; a single CDN hiccup inside the edge
// sandbox must not produce a textless image, so we try mirrors in order.
const FONT_SOURCES: string[][] = [
  [
    'https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Regular.ttf',
    'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf',
  ],
  [
    'https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Bold.ttf',
    'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Bold.ttf',
  ],
]

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

// Load one weight, trying each mirror until one yields valid font bytes.
async function loadFont(mirrors: string[]): Promise<Uint8Array> {
  let lastErr: unknown
  for (const url of mirrors) {
    try {
      const res = await fetchWithTimeout(url, 4000)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = new Uint8Array(await res.arrayBuffer())
      // Sanity-check it's a real sfnt font (0x00010000 TrueType or 'OTTO').
      if (buf.length < 4) throw new Error('empty body')
      const sig = (buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3]
      const isTrueType = sig === 0x00010000
      const isOtto = buf[0] === 0x4f && buf[1] === 0x54 && buf[2] === 0x54 && buf[3] === 0x4f
      if (!isTrueType && !isOtto) throw new Error('not a TTF/OTF')
      return buf
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error(`all mirrors failed: ${(lastErr as Error)?.message}`)
}

let fontBuffersReady: Promise<Uint8Array[]> | null = null
function ensureFonts(): Promise<Uint8Array[]> {
  if (!fontBuffersReady) {
    fontBuffersReady = Promise.all(FONT_SOURCES.map(loadFont)).catch((e) => {
      // Reset so a later request can retry rather than caching the failure.
      fontBuffersReady = null
      throw e
    })
  }
  return fontBuffersReady
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
      const text = `<text x="${pillX + 24}" y="${pillY + 34}" font-size="26" font-weight="600" fill="${pill.color}" font-family="Roboto">${esc(pill.label)}</text>`
      pillX += w + 16
      return rect + text
    })
    .join('')

  const footerY = 560
  let footerX = 64
  const footerParts: string[] = []
  if (daysLeft) {
    footerParts.push(`<text x="${footerX}" y="${footerY}" font-size="26" fill="#94a3b8" font-family="Roboto">${esc(daysLeft)}d left</text>`)
    footerX += daysLeft.length * 16 + 90
  }
  footerParts.push(`<text x="${footerX}" y="${footerY}" font-size="26" fill="#94a3b8" font-family="Roboto">${esc(applied)} applied</text>`)
  footerX += String(applied).length * 16 + 110
  if (niche) {
    const nw = niche.length * 15 + 36
    footerParts.push(`<rect x="${footerX}" y="${footerY - 30}" width="${nw}" height="40" rx="10" fill="#3a1414" stroke="#dc2626"/>`)
    footerParts.push(`<text x="${footerX + 18}" y="${footerY}" font-size="24" font-weight="600" fill="#f87171" font-family="Roboto">${esc(niche)}</text>`)
  }
  const budgetSvg = formattedBudget
    ? `<text x="1136" y="${footerY}" font-size="40" font-weight="700" fill="#ffffff" text-anchor="end" font-family="Roboto">${esc(formattedBudget)}</text>
       <text x="1136" y="${footerY + 30}" font-size="22" fill="#64748b" text-anchor="end" font-family="Roboto">/${esc(paymentModel)}</text>`
    : ''

  const titleSvg = titleLines
    .map((line, i) => `<text x="168" y="${175 + i * 52}" font-size="44" font-weight="700" fill="#ffffff" font-family="Roboto">${esc(line)}</text>`)
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
  <text x="104" y="150" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="Roboto">${esc(brandInitials)}</text>
  ${brand ? `<text x="168" y="122" font-size="26" fill="#a78bfa" font-family="Roboto">${esc(brand)}</text>` : ''}
  ${titleSvg}
  ${pillSvg}
  ${footerParts.join('\n  ')}
  ${budgetSvg}
  <rect x="64" y="592" width="22" height="22" rx="6" fill="url(#avatar)"/>
  <text x="94" y="608" font-size="18" fill="#64748b" font-family="Roboto">Colabrise</text>
</svg>`
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const svg = buildSvg(url.searchParams)

  try {
    await ensureWasm()
    const fontBuffers = await ensureFonts()

    // Never render a textless PNG: if no usable font loaded, the output would
    // be the "boxes but no values" card the share preview was showing. Treat
    // that as a hard failure so the catch runs instead of emitting tofu.
    if (!fontBuffers.length) throw new Error('no font buffers loaded')

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        // Load our own font bytes (no system fonts in the sandbox). The SVG now
        // names "Roboto" directly, and we also map the generic families to it
        // so every <text> resolves to real glyphs instead of .notdef boxes.
        fontBuffers,
        loadSystemFonts: false,
        defaultFontFamily: 'Roboto',
        sansSerifFamily: 'Roboto',
      },
    })
    const pngData = resvg.render().asPng()

    return new Response(pngData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Short cache so a transient font-fetch failure can't pin a bad image
        // for an hour; social scrapers still cache on their own side.
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (err) {
    if (url.searchParams.get('debug') === '1') {
      return new Response(
        `og-image error: ${(err as Error)?.message}\n\n${(err as Error)?.stack}`,
        { status: 500, headers: { 'Content-Type': 'text/plain' } },
      )
    }
    // Do NOT fall back to raw SVG — WhatsApp/Facebook can't render SVG as an
    // og:image, which is exactly how the blank card slips through. Return a
    // non-200 with no-cache so scrapers retry rather than caching a blank.
    return new Response('og-image generation failed', {
      status: 502,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
    })
  }
}

export const config = { path: '/api/og-image' }

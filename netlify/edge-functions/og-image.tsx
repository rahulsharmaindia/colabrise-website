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

// Rough text width estimate for Roboto at a given font size (used to size
// pills and position inline elements). ~0.56em average advance works well.
function textWidth(s: string, fontSize: number): number {
  return s.length * fontSize * 0.56
}

// Deliverable glyph colors mirror the overview card (reel=purple, story=cyan,
// post=emerald). Returns a tiny inline icon + label for one deliverable part.
function deliverableColor(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('reel')) return '#a855f7'
  if (l.includes('stor')) return '#06b6d4'
  if (l.includes('post')) return '#10b981'
  return '#64748b'
}

/**
 * Builds the share card as a LIGHT card that mirrors the in-app campaign
 * overview card: title + status badge, platform row (Instagram glyph + name),
 * niche/payment pills, deliverables with colored icons, a divider, then a
 * footer with date, slots and budget. The long description is intentionally
 * omitted. Layout targets a 1200×630 OG canvas.
 */
function buildSvg(p: URLSearchParams): string {
  const title = p.get('t') || 'Campaign on Colabrise'
  const budget = p.get('p') || ''
  const niche = p.get('n') || ''
  const paymentModel = p.get('pm') || 'Fixed'
  const deliverables = p.get('dl') || ''
  const platform = p.get('plat') || 'Instagram'
  const status = (p.get('st') || '').toLowerCase()
  const date = p.get('date') || ''
  const slots = p.get('slots') || '' // e.g. "0/10"

  const formattedBudget = budget ? `\u20B9${Number(budget).toLocaleString('en-IN')}` : ''
  const titleLines = wrapText(title, 30, 2)

  // ── Card geometry ──────────────────────────────────────────────────────────
  const CARD_X = 80
  const CARD_Y = 70
  const CARD_W = 1040
  const CARD_H = 490
  const PAD = 56 // inner padding
  const left = CARD_X + PAD
  const right = CARD_X + CARD_W - PAD

  // ── Title + status badge ─────────────────────────────────────────────────────
  const titleY = CARD_Y + PAD + 44
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${left}" y="${titleY + i * 58}" font-size="52" font-weight="700" fill="#0f172a" font-family="Roboto">${esc(line)}</text>`,
    )
    .join('')

  const STATUS_COLORS: Record<string, { fill: string; text: string }> = {
    draft: { fill: '#e2e8f0', text: '#475569' },
    active: { fill: '#dcfce7', text: '#15803d' },
    published: { fill: '#dbeafe', text: '#1d4ed8' },
    completed: { fill: '#dbeafe', text: '#1d4ed8' },
    expired: { fill: '#fee2e2', text: '#b91c1c' },
    cancelled: { fill: '#fee2e2', text: '#b91c1c' },
  }
  let statusSvg = ''
  if (status) {
    const c = STATUS_COLORS[status] ?? { fill: '#e2e8f0', text: '#475569' }
    const sw = textWidth(status, 26) + 44
    const sx = right - sw
    const sy = CARD_Y + PAD - 6
    statusSvg =
      `<rect x="${sx}" y="${sy}" width="${sw}" height="48" rx="24" fill="${c.fill}"/>` +
      `<text x="${sx + sw / 2}" y="${sy + 32}" font-size="26" font-weight="600" fill="${c.text}" text-anchor="middle" font-family="Roboto">${esc(status)}</text>`
  }

  // ── Platform row (Instagram glyph + name) ────────────────────────────────────
  const platY = titleY + (titleLines.length - 1) * 58 + 52
  // Simple rounded-square Instagram glyph in brand pink.
  const igIcon =
    `<rect x="${left}" y="${platY - 24}" width="34" height="34" rx="10" fill="none" stroke="#ec4899" stroke-width="3.5"/>` +
    `<circle cx="${left + 17}" cy="${platY - 7}" r="8" fill="none" stroke="#ec4899" stroke-width="3.5"/>` +
    `<circle cx="${left + 27}" cy="${platY - 17}" r="2.6" fill="#ec4899"/>`
  const platSvg =
    igIcon +
    `<text x="${left + 48}" y="${platY}" font-size="30" fill="#64748b" font-family="Roboto">${esc(platform)}</text>`

  // ── Niche + payment pills ────────────────────────────────────────────────────
  const pillY = platY + 44
  let pillX = left
  const pillParts: string[] = []
  if (niche) {
    const w = textWidth(niche, 28) + 76
    pillParts.push(`<rect x="${pillX}" y="${pillY}" width="${w}" height="52" rx="26" fill="#e0f2fe"/>`)
    // target glyph
    pillParts.push(`<circle cx="${pillX + 30}" cy="${pillY + 26}" r="11" fill="none" stroke="#0284c7" stroke-width="3"/>`)
    pillParts.push(`<circle cx="${pillX + 30}" cy="${pillY + 26}" r="4" fill="#0284c7"/>`)
    pillParts.push(`<text x="${pillX + 50}" y="${pillY + 35}" font-size="28" font-weight="600" fill="#0284c7" font-family="Roboto">${esc(niche)}</text>`)
    pillX += w + 20
  }
  if (paymentModel) {
    const w = textWidth(paymentModel, 28) + 76
    pillParts.push(`<rect x="${pillX}" y="${pillY}" width="${w}" height="52" rx="26" fill="#f1f5f9"/>`)
    pillParts.push(`<text x="${pillX + 26}" y="${pillY + 36}" font-size="28" fill="#475569" font-family="Roboto">\u20B9</text>`)
    pillParts.push(`<text x="${pillX + 50}" y="${pillY + 35}" font-size="28" font-weight="500" fill="#475569" font-family="Roboto">${esc(paymentModel)}</text>`)
    pillX += w + 20
  }
  const pillSvg = pillParts.join('')

  // ── Deliverables row (icon + label per part) ─────────────────────────────────
  const delivY = pillY + 94
  let delivX = left
  const delivParts: string[] = []
  if (deliverables) {
    for (const part of deliverables.split('+').map((x) => x.trim()).filter(Boolean)) {
      const color = deliverableColor(part)
      // small rounded square icon
      delivParts.push(`<rect x="${delivX}" y="${delivY - 22}" width="30" height="30" rx="7" fill="none" stroke="${color}" stroke-width="3"/>`)
      delivParts.push(`<text x="${delivX + 44}" y="${delivY}" font-size="28" fill="#64748b" font-family="Roboto">${esc(part)}</text>`)
      delivX += 44 + textWidth(part, 28) + 44
    }
  }
  const delivSvg = delivParts.join('')

  // ── Divider ──────────────────────────────────────────────────────────────────
  const divY = delivY + 56
  const dividerSvg = `<line x1="${left}" y1="${divY}" x2="${right}" y2="${divY}" stroke="#e2e8f0" stroke-width="2"/>`

  // ── Footer: date · slots · budget ────────────────────────────────────────────
  const footerY = divY + 56
  let footX = left
  const footParts: string[] = []
  if (date) {
    footParts.push(`<rect x="${footX}" y="${footerY - 24}" width="28" height="26" rx="6" fill="none" stroke="#94a3b8" stroke-width="2.5"/>`)
    footParts.push(`<text x="${footX + 42}" y="${footerY}" font-size="28" fill="#64748b" font-family="Roboto">${esc(date)}</text>`)
    footX += 42 + textWidth(date, 28) + 56
  }
  if (slots) {
    footParts.push(`<circle cx="${footX + 12}" cy="${footerY - 12}" r="9" fill="none" stroke="#94a3b8" stroke-width="2.5"/>`)
    footParts.push(`<text x="${footX + 34}" y="${footerY}" font-size="28" fill="#64748b" font-family="Roboto">${esc(slots)}</text>`)
  }
  // Budget right-aligned.
  const budgetSvg = formattedBudget
    ? `<text x="${right}" y="${footerY}" font-size="40" font-weight="700" fill="#0f172a" text-anchor="end" font-family="Roboto">${esc(formattedBudget)}</text>`
    : ''

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eef2ff"/><stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Card -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="28" fill="#ffffff" stroke="#bfdbfe" stroke-width="3"/>
  ${titleSvg}
  ${statusSvg}
  ${platSvg}
  ${pillSvg}
  ${delivSvg}
  ${dividerSvg}
  ${footParts.join('\n  ')}
  ${budgetSvg}
  <!-- Brand mark -->
  <rect x="${left}" y="590" width="20" height="20" rx="6" fill="#8b5cf6"/>
  <text x="${left + 30}" y="606" font-size="20" fill="#94a3b8" font-family="Roboto">Colabrise</text>
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

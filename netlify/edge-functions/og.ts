/**
 * Netlify Edge Function — OG meta tags for campaign share links.
 *
 * Always returns OG HTML:
 * - Bots (WhatsApp, Telegram, etc.) read the meta tags → show preview.
 * - Browsers run the <script> redirect → land on the SPA campaign page.
 *
 * Route (via netlify.toml): /api/og
 */

import type { Context } from 'https://edge.netlify.com'

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default async function handler(request: Request, _context: Context) {
  const url = new URL(request.url)
  const p = url.searchParams

  const title = p.get('t') || 'Campaign on Colabrise'
  const brand = p.get('b') || ''
  const budget = p.get('p') || ''
  const id = p.get('id') || ''
  const niche = p.get('n') || ''

  const ogTitle = brand ? `${title} — ${brand}` : title
  const parts: string[] = []
  if (budget) parts.push(`Budget: \u20B9${Number(budget).toLocaleString('en-IN')}/creator`)
  if (niche) parts.push(niche)
  const ogDescription = parts.length > 0
    ? parts.join(' | ')
    : 'Join this campaign on Colabrise and collaborate with top brands.'

  const canonicalUrl = `${url.origin}/campaigns/${id}`

  // Build the OG image URL with same params
  const imageParams = new URLSearchParams()
  imageParams.set('t', title)
  if (brand) imageParams.set('b', brand)
  if (budget) imageParams.set('p', budget)
  if (niche) imageParams.set('n', niche)
  for (const key of ['pm', 'f', 'ft', 'dl', 'days', 'app']) {
    const v = p.get(key)
    if (v) imageParams.set(key, v)
  }
  const ogImage = `${url.origin}/api/og-image?${imageParams.toString()}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(ogTitle)}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDescription)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:image:secure_url" content="${esc(ogImage)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(ogTitle)}" />
  <meta property="og:url" content="${esc(canonicalUrl)}" />
  <meta property="og:site_name" content="Colabrise" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(ogDescription)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  <script>window.location.replace(${JSON.stringify(canonicalUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${esc(canonicalUrl)}">${esc(ogTitle)}</a>...</p>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const config = { path: '/api/og' }

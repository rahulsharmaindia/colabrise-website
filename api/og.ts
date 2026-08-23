import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function — returns HTML with OG meta tags for
 * campaign share links when accessed by social media bots.
 *
 * Route: /api/og?id=campaignId&t=Title&b=Brand&d=Description&p=Budget
 *
 * The main index.html has a fallback OG tag pointing here via the
 * campaign share page, but the primary path is:
 * - User shares link → WhatsApp fetches /campaigns/:id?t=...&b=...
 * - vercel.json rewrites /campaigns/* to /api/og for bot user-agents
 * - This function returns OG-tagged HTML
 */

const BOT_UA_PATTERNS = [
  'whatsapp',
  'telegrambot',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
]

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern))
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ua = (req.headers['user-agent'] ?? '') as string

  // If not a bot, redirect to the SPA page
  if (!isBot(ua)) {
    const id = req.query.id as string ?? ''
    const qs = new URLSearchParams(req.query as Record<string, string>).toString()
    res.redirect(302, `/campaigns/${id}${qs ? '?' + qs : ''}`)
    return
  }

  const title = (req.query.t as string) || 'Campaign on Colabrise'
  const brand = (req.query.b as string) || ''
  const description = (req.query.d as string) || 'Join this campaign on Colabrise and collaborate with top brands.'
  const budget = (req.query.p as string) || ''

  const ogTitle = brand ? `${title} — ${brand}` : title
  const parts = [description]
  if (budget) parts.push(`Budget: \u20B9${Number(budget).toLocaleString('en-IN')}/creator`)
  const ogDescription = parts.join(' | ')

  // Build origin from request
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'colabrise.com'
  const id = (req.query.id as string) || ''
  const canonicalUrl = `${proto}://${host}/campaigns/${id}`

  // OG image URL — points to the image generation endpoint with same params
  const imageParams = new URLSearchParams()
  imageParams.set('t', title)
  if (brand) imageParams.set('b', brand)
  if (description) imageParams.set('d', description)
  if (budget) imageParams.set('p', budget)
  const niche = (req.query.n as string) || ''
  if (niche) imageParams.set('n', niche)
  const ogImage = `${proto}://${host}/api/og-image?${imageParams.toString()}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(ogTitle)}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDescription)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${esc(canonicalUrl)}" />
  <meta property="og:site_name" content="Colabrise" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(ogDescription)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
</head>
<body>
  <h1>${esc(ogTitle)}</h1>
  <p>${esc(ogDescription)}</p>
  <p><a href="${esc(canonicalUrl)}">View on Colabrise</a></p>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600')
  res.status(200).send(html)
}

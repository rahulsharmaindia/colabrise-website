/**
 * Netlify Edge Function — Dynamic OG meta tags for campaign URLs.
 *
 * When WhatsApp/Instagram/Telegram/Twitter bots fetch a campaign link,
 * this function injects Open Graph meta tags so the link preview shows
 * the campaign title, description, brand name, and budget.
 *
 * Real users (browsers) get the normal SPA — no difference in behavior.
 */

const API_BASE = 'https://nanoboost-production.up.railway.app'

// Bot User-Agent patterns that request link previews
const BOT_UA_PATTERNS = [
  'whatsapp',
  'telegrambot',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'applebot',
]

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern))
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatBudget(amount?: number | null): string {
  if (!amount) return ''
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') ?? ''

  // Only intercept for bots — real users get the normal SPA
  if (!isBot(userAgent)) {
    return
  }

  // Extract campaign ID from path: /campaigns/:id or /dashboard/campaigns/:id
  const match = url.pathname.match(/\/campaigns\/([a-zA-Z0-9-]+)/)
  if (!match) {
    return
  }

  const campaignId = match[1]

  // Try to fetch campaign data from the API (public-ish — no auth needed for OG)
  // The marketplace endpoint returns published campaigns without auth
  try {
    const res = await fetch(`${API_BASE}/api/marketplace/campaigns?includeExpired=true`, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return // Fall through to normal SPA
    }

    const body = await res.json()
    const campaigns = body?.data ?? body
    const campaign = Array.isArray(campaigns)
      ? campaigns.find((c: Record<string, unknown>) => c.campaignId === campaignId)
      : null

    if (!campaign) {
      return // Campaign not found — fall through to SPA
    }

    // Build OG meta tags
    const title = escapeHtml(campaign.title ?? 'Campaign on Colabrise')
    const brandName = campaign.brandName ? escapeHtml(campaign.brandName) : ''
    const description = escapeHtml(
      campaign.description
        ?? `${brandName ? brandName + ' — ' : ''}Join this campaign on Colabrise`
    )
    const budget = campaign.budgetPerCreator ? formatBudget(campaign.budgetPerCreator) : ''
    const niche = campaign.preferredNiche ? escapeHtml(campaign.preferredNiche) : ''
    const slots = campaign.totalSlots ? `${campaign.totalSlots} slots` : ''

    // Build a text-based summary for og:description
    const parts = [description]
    if (budget) parts.push(`Budget: ${budget}/creator`)
    if (niche) parts.push(`Niche: ${niche}`)
    if (slots) parts.push(slots)
    const ogDescription = parts.join(' | ')

    const ogTitle = brandName ? `${title} — ${brandName}` : title
    const ogUrl = url.toString()
    const siteName = 'Colabrise'

    // Return a minimal HTML page with OG tags
    // Bots only read the <head>, they don't render the page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${ogTitle}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(ogUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(ogUrl)}">${ogTitle}</a>...</p>
</body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    // On any error, fall through to the normal SPA
    return
  }
}

export const config = {
  path: ['/campaigns/*', '/dashboard/campaigns/*'],
}

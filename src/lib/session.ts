/**
 * Local storage of session ids for both influencer (Google OAuth) and
 * brand (businessId + password) auth flows, plus the OAuth poll-token
 * handshake used while a Google sign-in tab is open.
 *
 * Decoupled from any specific page/component so it can be reused by the
 * api-client (attaching Authorization headers) and by any page that needs
 * to check "is the user currently signed in".
 */

const INFLUENCER_SESSION_KEY = 'colabrise_influencer_session_id'
const BRAND_SESSION_KEY = 'colabrise_brand_session_id'
const POLL_TOKEN_KEY = 'colabrise_google_poll_token'

// ── Influencer session ──────────────────────────────────────

export function getInfluencerSessionId(): string | null {
  try {
    return localStorage.getItem(INFLUENCER_SESSION_KEY)
  } catch {
    return null
  }
}

export function setInfluencerSessionId(sessionId: string): void {
  try {
    localStorage.setItem(INFLUENCER_SESSION_KEY, sessionId)
  } catch {}
}

export function clearInfluencerSessionId(): void {
  try {
    localStorage.removeItem(INFLUENCER_SESSION_KEY)
  } catch {}
}

// ── Brand session ───────────────────────────────────────────

export function getBrandSessionId(): string | null {
  try {
    return localStorage.getItem(BRAND_SESSION_KEY)
  } catch {
    return null
  }
}

export function setBrandSessionId(sessionId: string): void {
  try {
    localStorage.setItem(BRAND_SESSION_KEY, sessionId)
  } catch {}
}

export function clearBrandSessionId(): void {
  try {
    localStorage.removeItem(BRAND_SESSION_KEY)
  } catch {}
}

// ── Generic: any session ────────────────────────────────────

/** Returns the first valid session id found (influencer or brand). */
export function getAnySessionId(): string | null {
  return getInfluencerSessionId() ?? getBrandSessionId()
}

export function clearAllSessions(): void {
  clearInfluencerSessionId()
  clearBrandSessionId()
}

// ── Google OAuth poll token ─────────────────────────────────

export function getGooglePollToken(): string | null {
  try {
    return sessionStorage.getItem(POLL_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setGooglePollToken(pollToken: string): void {
  try {
    sessionStorage.setItem(POLL_TOKEN_KEY, pollToken)
  } catch {}
}

export function clearGooglePollToken(): void {
  try {
    sessionStorage.removeItem(POLL_TOKEN_KEY)
  } catch {}
}

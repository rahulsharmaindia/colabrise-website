import { useSyncExternalStore } from 'react'
import { getBrandSessionId, getInfluencerSessionId } from '../../lib/session'

export type UserRole = 'brand' | 'creator' | null

/**
 * Returns the current user role based on which session key exists
 * in localStorage. Brand session takes priority when both exist
 * (unlikely in practice).
 */
function getRole(): UserRole {
  if (getBrandSessionId()) return 'brand'
  if (getInfluencerSessionId()) return 'creator'
  return null
}

// Simple snapshot-based store for useSyncExternalStore
let cachedRole = getRole()

function subscribe(callback: () => void) {
  // Listen for storage changes (e.g. login/logout in another tab)
  const handler = () => {
    cachedRole = getRole()
    callback()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

function getSnapshot() {
  // Re-derive on each call so it picks up same-tab changes
  const current = getRole()
  if (current !== cachedRole) cachedRole = current
  return cachedRole
}

export function useUserRole(): UserRole {
  return useSyncExternalStore(subscribe, getSnapshot)
}

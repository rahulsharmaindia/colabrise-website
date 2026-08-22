import { useCallback, useEffect, useRef, useState } from 'react'
import { getAuthStatus, pollGoogleAuth, startGoogleAuth } from '../api/auth'
import { getErrorMessage } from '../lib/api-client'
import {
  clearGooglePollToken,
  getGooglePollToken,
  setGooglePollToken,
  setInfluencerSessionId,
} from '../lib/session'

export type GoogleAuthState =
  | { step: 'idle' }
  | { step: 'awaiting-popup' }
  | { step: 'error'; message: string }
  | { step: 'authenticated'; sessionId: string; email: string | null; profileComplete: boolean }

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 2 * 60 * 1000

/**
 * Drives the Google OAuth popup + poll flow described in
 * nanoceleb/nanoboost/src/modules/auth/auth.controller.ts. Kept as a
 * standalone hook (no UI, no direct DOM access beyond window.open) so any
 * page can trigger creator sign-in without re-implementing the polling
 * mechanics.
 */
export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({ step: 'idle' })
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollDeadlineRef = useRef<number>(0)

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const finishAuthenticated = useCallback(async (sessionId: string) => {
    setInfluencerSessionId(sessionId)
    clearGooglePollToken()
    try {
      const status = await getAuthStatus(sessionId)
      setState({
        step: 'authenticated',
        sessionId,
        email: status.email,
        profileComplete: status.profile_completion_status === 'complete',
      })
    } catch (error) {
      // Session was issued but the status check failed — still treat the
      // sign-in as successful since the session id is valid; the profile
      // form will simply render without a pre-filled email.
      setState({ step: 'authenticated', sessionId, email: null, profileComplete: false })
      console.error(getErrorMessage(error))
    }
  }, [])

  const beginPolling = useCallback(
    (pollToken: string) => {
      stopPolling()
      setGooglePollToken(pollToken)
      pollDeadlineRef.current = Date.now() + POLL_TIMEOUT_MS

      pollTimerRef.current = setInterval(async () => {
        if (Date.now() > pollDeadlineRef.current) {
          stopPolling()
          clearGooglePollToken()
          setState({ step: 'error', message: 'Sign-in timed out. Please try again.' })
          return
        }

        try {
          const result = await pollGoogleAuth(pollToken)
          if (result.status === 'authenticated' && result.session_id) {
            stopPolling()
            await finishAuthenticated(result.session_id)
          } else if (result.status === 'error' || result.status === 'not_found') {
            stopPolling()
            clearGooglePollToken()
            setState({ step: 'error', message: 'Google sign-in failed. Please try again.' })
          }
          // 'pending' — keep polling.
        } catch (error) {
          stopPolling()
          clearGooglePollToken()
          setState({ step: 'error', message: getErrorMessage(error) })
        }
      }, POLL_INTERVAL_MS)
    },
    [finishAuthenticated, stopPolling],
  )

  // Resume a poll that was in flight before a page reload (poll token
  // persists in sessionStorage), and pick up ?status=/&session_id= if the
  // OAuth tab navigated this same window instead of closing itself.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    const sessionId = params.get('session_id')
    const reason = params.get('reason')

    if (status === 'authenticated' && sessionId) {
      clearGooglePollToken()
      void finishAuthenticated(sessionId)
      window.history.replaceState({}, '', window.location.pathname)
      return
    }
    if (status === 'error') {
      clearGooglePollToken()
      setState({ step: 'error', message: reason ?? 'Google sign-in failed. Please try again.' })
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    const existingPollToken = getGooglePollToken()
    if (existingPollToken) {
      setState({ step: 'awaiting-popup' })
      beginPolling(existingPollToken)
    }

    return () => stopPolling()
    // Intentionally run once on mount to resume any in-flight poll.
  }, [])

  const signIn = useCallback(async () => {
    setState({ step: 'awaiting-popup' })
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`
      const { auth_url, poll_token } = await startGoogleAuth(redirectUri)
      const popup = window.open(auth_url, 'colabrise-google-auth', 'width=480,height=640')
      if (!popup) {
        // Popup blocked — fall back to a full-window navigation. The
        // server will redirect back to this same URL with
        // ?status=&session_id= once the OAuth flow completes.
        window.location.href = auth_url
        return
      }
      beginPolling(poll_token)
    } catch (error) {
      setState({ step: 'error', message: getErrorMessage(error) })
    }
  }, [beginPolling])

  const reset = useCallback(() => {
    stopPolling()
    clearGooglePollToken()
    setState({ step: 'idle' })
  }, [stopPolling])

  return { state, signIn, reset }
}

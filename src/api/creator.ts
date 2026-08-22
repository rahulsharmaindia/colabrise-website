import { apiClient } from '../lib/api-client'

/**
 * Creator profile completion — mirrors nanoboost's SubmitProfileDto
 * (nanoceleb/nanoboost/src/modules/auth/account.controller.ts,
 * POST /api/account/profile). Requires an authenticated influencer
 * session (Authorization: Bearer <sessionId>), attached automatically by
 * apiClient once a Google sign-in has completed.
 */
export interface SubmitCreatorProfilePayload {
  instagramHandle: string
  niche: string
  followerCount: number
  contactNumber: string
  pricePerReel: number
  pricePerPost: number
  pricePerStory: number
  priceAdRights15Days: number
  displayName?: string
  profilePictureDataUri?: string
}

export interface SubmitCreatorProfileResponse {
  profile_completion_status: 'complete'
}

export async function submitCreatorProfile(
  payload: SubmitCreatorProfilePayload,
): Promise<SubmitCreatorProfileResponse> {
  const { data } = await apiClient.post<SubmitCreatorProfileResponse>(
    '/api/account/profile',
    payload,
  )
  return data
}

import { apiClient } from '../lib/api-client'

/**
 * Brand registration — mirrors nanoboost's RegisterBrandDto
 * (nanoceleb/nanoboost/src/modules/brands/dto/register-brand.dto.ts).
 * POST /api/brand/register is public, no auth required.
 */
export interface RegisterBrandPayload {
  name: string
  businessId: string
  industry: string
  password: string
  website?: string
  description?: string
  socialLinks?: Record<string, string>
}

export interface LoginBrandPayload {
  businessId: string
  password: string
}

export interface BrandProfile {
  businessId: string
  name: string
  industry: string
  logo: string | null
  website: string | null
  description: string | null
  socialLinks: Record<string, string | null> | null
}

export interface BrandAuthResponse {
  sessionId: string
  brandData: BrandProfile
}

export async function registerBrand(payload: RegisterBrandPayload): Promise<BrandAuthResponse> {
  const { data } = await apiClient.post<BrandAuthResponse>('/api/brand/register', payload)
  return data
}

export async function loginBrand(payload: LoginBrandPayload): Promise<BrandAuthResponse> {
  const { data } = await apiClient.post<BrandAuthResponse>('/api/brand/login', payload)
  return data
}

/** Fetch the authenticated brand's own profile. GET /api/brand */
export async function getBrandProfile(): Promise<BrandProfile> {
  const { data } = await apiClient.get<BrandProfile>('/api/brand')
  return data
}

/** Partial update of the authenticated brand profile. PATCH /api/brand */
export async function updateBrandProfile(
  updates: Partial<Omit<BrandProfile, 'businessId'>>,
): Promise<BrandProfile> {
  const { data } = await apiClient.patch<BrandProfile>('/api/brand', updates)
  return data
}

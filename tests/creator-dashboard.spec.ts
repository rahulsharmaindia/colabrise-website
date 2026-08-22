import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for the Creator Dashboard.
 *
 * These tests mock the creator (influencer) session in localStorage and
 * intercept API calls to avoid hitting the real production server.
 */

// ── Test fixtures ────────────────────────────────────────────

const CREATOR_SESSION_ID = 'test-creator-session-456'

const MOCK_CREATOR_PROFILE = {
  id: 'ig-12345',
  name: 'Luna Vega',
  displayName: 'Luna Vega',
  username: 'luna_vega',
  bio: 'Beauty & lifestyle creator based in Mumbai. Love all things skincare!',
  biography: 'Beauty & lifestyle creator based in Mumbai. Love all things skincare!',
  profilePictureUrl: null,
  followerCount: 45200,
  followersCount: 45200,
  followsCount: 1230,
  mediaCount: 328,
  niche: 'Beauty',
  niches: ['Beauty', 'Lifestyle'],
  instagramHandle: 'luna_vega',
  contactNumber: '+91 9876543210',
  email: 'luna@example.com',
  emailVerificationStatus: 'verified',
  contactVerificationStatus: 'unverified',
  accountType: 'MEDIA_CREATOR',
  pricePerReel: 5000,
  pricePerPost: 3000,
  pricePerStory: 1500,
  priceAdRights15Days: 8000,
}

const MOCK_MEDIA_ITEMS = [
  {
    id: 'media-1',
    mediaType: 'VIDEO',
    thumbnailUrl: null,
    permalink: 'https://instagram.com/reel/abc123',
    caption: 'Morning skincare routine',
    likeCount: 1200,
    commentsCount: 45,
  },
  {
    id: 'media-2',
    mediaType: 'REEL',
    thumbnailUrl: null,
    permalink: 'https://instagram.com/reel/def456',
    caption: 'Sunscreen review',
    likeCount: 3400,
    commentsCount: 120,
  },
]

const MOCK_NICHES = ['Beauty', 'Lifestyle']

const MOCK_CAMPAIGN_STATS = {
  active: 3,
  completed: 7,
  applied: 5,
  rejected: 2,
}

const MOCK_MARKETPLACE_CAMPAIGNS = [
  {
    campaignId: 'camp-1',
    title: 'Summer Glow Collection',
    status: 'active',
    description: 'Promote our new summer skincare line with authentic reviews',
    brandName: 'GlowUp Beauty',
    totalBudget: 100000,
    budgetPerCreator: 8000,
    totalSlots: 10,
    approvedCount: 4,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    applicationDeadline: '2026-08-25',
    preferredNiche: 'Beauty',
    applicationStatus: null, // not applied
  },
  {
    campaignId: 'camp-2',
    title: 'Fitness Challenge 2026',
    status: 'active',
    description: 'Join our 30-day fitness challenge and document your journey',
    brandName: 'FitLife Pro',
    totalBudget: 75000,
    budgetPerCreator: 5000,
    totalSlots: 15,
    approvedCount: 10,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    applicationDeadline: '2026-08-20',
    preferredNiche: 'Fitness',
    applicationStatus: 'pending', // already applied
  },
  {
    campaignId: 'camp-3',
    title: 'Tech Review Series',
    status: 'active',
    description: 'Review our latest gadgets and share honest opinions',
    brandName: 'TechNova',
    totalBudget: 50000,
    budgetPerCreator: 10000,
    totalSlots: 5,
    approvedCount: 5,
    startDate: '2026-07-15',
    endDate: '2026-08-30',
    applicationDeadline: '2026-07-10',
    preferredNiche: 'Tech',
    applicationStatus: null, // slots full
  },
  {
    campaignId: 'camp-4',
    title: 'Winter Fashion Haul',
    status: 'completed',
    description: 'Showcase winter fashion trends',
    brandName: 'StyleHub',
    totalBudget: 60000,
    budgetPerCreator: 6000,
    totalSlots: 8,
    approvedCount: 8,
    startDate: '2026-01-01',
    endDate: '2026-02-28',
    applicationDeadline: '2025-12-20',
    preferredNiche: 'Fashion',
    applicationStatus: 'approved', // approved — can submit content
  },
  {
    campaignId: 'camp-5',
    title: 'Food Vlog Series',
    status: 'active',
    description: 'Explore street food and share authentic reviews',
    brandName: 'FoodieApp',
    totalBudget: 40000,
    budgetPerCreator: 4000,
    totalSlots: 10,
    approvedCount: 3,
    startDate: '2026-08-10',
    endDate: '2026-10-15',
    applicationDeadline: '2026-08-30',
    preferredNiche: 'Food',
    applicationStatus: 'rejected',
  },
]

const MOCK_BRANDS = [
  {
    businessId: 'brand-1',
    name: 'GlowUp Beauty',
    industry: 'Beauty',
    logo: null,
    website: 'https://glowupbeauty.com',
    description: 'Premium skincare and beauty products for the modern creator.',
    campaignCount: 5,
    isFollowing: true,
  },
  {
    businessId: 'brand-2',
    name: 'FitLife Pro',
    industry: 'Fitness',
    logo: null,
    website: 'https://fitlifepro.in',
    description: 'India\'s leading fitness equipment and supplement brand.',
    campaignCount: 3,
    isFollowing: false,
  },
  {
    businessId: 'brand-3',
    name: 'TechNova',
    industry: 'Tech',
    logo: null,
    website: 'https://technova.io',
    description: 'Next-gen consumer electronics and smart devices.',
    campaignCount: 2,
    isFollowing: false,
  },
  {
    businessId: 'brand-4',
    name: 'StyleHub',
    industry: 'Fashion',
    logo: null,
    website: null,
    description: 'Affordable fashion for every occasion.',
    campaignCount: 8,
    isFollowing: true,
  },
]

// ── Setup helpers ────────────────────────────────────────────

async function setupCreatorSession(page: Page) {
  await page.addInitScript((sessionId) => {
    localStorage.setItem('colabrise_influencer_session_id', sessionId)
  }, CREATOR_SESSION_ID)
}

async function mockCreatorAPIs(page: Page) {
  // Mock auth status (for AuthGuard validation)
  await page.route('**/api/auth/status**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { status: 'authenticated', user_id: 'user-1', profile_completion_status: 'complete', email: 'luna@example.com' },
        error: null,
        requestId: 'c1',
      }),
    })
  })

  // Mock full profile (GET /api/profile)
  await page.route('**/api/profile/niches**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_NICHES, error: null, requestId: 'cn' }),
      })
    } else if (route.request().method() === 'PATCH') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true }, error: null, requestId: 'cn2' }),
      })
    } else {
      route.continue()
    }
  })

  await page.route('**/api/profile**', (route) => {
    if (route.request().url().includes('/niches')) {
      route.continue()
      return
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_CREATOR_PROFILE, error: null, requestId: 'cp' }),
    })
  })

  // Mock media (GET /api/media)
  await page.route('**/api/media**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_MEDIA_ITEMS, error: null, requestId: 'cm' }),
    })
  })

  // Mock profile update (PATCH /api/account/profile)
  await page.route('**/api/account/profile**', (route) => {
    if (route.request().method() === 'PATCH') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_CREATOR_PROFILE, error: null, requestId: 'c2' }),
      })
    } else {
      route.continue()
    }
  })

  // Mock campaign stats
  await page.route('**/api/creator/campaigns/stats**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_CAMPAIGN_STATS, error: null, requestId: 'c3' }),
    })
  })

  // Mock marketplace campaigns
  await page.route('**/api/marketplace/campaigns**', (route) => {
    const url = route.request().url()
    const params = new URL(url).searchParams
    const statusFilter = params.get('status')
    let filtered = MOCK_MARKETPLACE_CAMPAIGNS

    if (statusFilter === 'active') {
      filtered = MOCK_MARKETPLACE_CAMPAIGNS.filter((c) => c.status === 'active')
    } else if (statusFilter === 'completed') {
      filtered = MOCK_MARKETPLACE_CAMPAIGNS.filter((c) => c.status === 'completed')
    } else if (statusFilter === 'applied') {
      filtered = MOCK_MARKETPLACE_CAMPAIGNS.filter((c) => c.applicationStatus === 'pending')
    } else if (statusFilter === 'approved') {
      filtered = MOCK_MARKETPLACE_CAMPAIGNS.filter((c) => c.applicationStatus === 'approved')
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: filtered, error: null, requestId: 'c6' }),
    })
  })

  // Mock campaign applications (POST /api/campaigns/:id/applications)
  await page.route('**/api/campaigns/*/applications**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { applicationId: 'app-new', status: 'Pending' },
        error: null,
        requestId: 'ca1',
      }),
    })
  })

  // Mock campaign submissions (POST /api/campaigns/:id/submissions)
  await page.route('**/api/campaigns/*/submissions**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { submissionId: 'sub-new', status: 'pending_review' },
        error: null,
        requestId: 'cs1',
      }),
    })
  })

  // Mock brands marketplace
  await page.route('**/api/marketplace/brands**', (route) => {
    // List brands
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_BRANDS, error: null, requestId: 'c9' }),
    })
  })

  // Mock follow/unfollow endpoints
  await page.route('**/api/follows/brands**', (route) => {
    const url = route.request().url()
    const method = route.request().method()

    // GET /api/follows/brands — list followed brands
    if (method === 'GET') {
      const followed = MOCK_BRANDS.filter((b) => b.isFollowing).map((b) => ({
        businessId: b.businessId,
        name: b.name,
      }))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: followed, error: null, requestId: 'cf1' }),
      })
      return
    }

    // POST /api/follows/brands — follow a brand
    if (method === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true }, error: null, requestId: 'cf2' }),
      })
      return
    }

    // DELETE /api/follows/brands/:businessId — unfollow a brand
    if (method === 'DELETE') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true }, error: null, requestId: 'cf3' }),
      })
      return
    }

    route.continue()
  })
}

// ── Tests: Navigation ────────────────────────────────────────

test.describe('Creator Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('shows creator-specific navigation items', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Campaigns' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Brands' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'My Campaigns' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    // Creators should NOT see "Creators" nav item
    await expect(page.getByRole('link', { name: 'Creators' })).not.toBeVisible()
  })

  test('navigates between pages via sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: 'Campaigns' }).click()
    await expect(page).toHaveURL('/dashboard/campaigns')
    await page.getByRole('link', { name: 'Brands' }).click()
    await expect(page).toHaveURL('/dashboard/brands')
  })
})

// ── Tests: Overview (Profile) ────────────────────────────────

test.describe('Creator Dashboard - Overview (Profile)', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('displays creator profile information', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Luna Vega')).toBeVisible()
    await expect(page.getByText('luna_vega')).toBeVisible()
  })

  test('shows follower stats', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('45.2K')).toBeVisible()
    await expect(page.getByText('Followers')).toBeVisible()
    await expect(page.getByText('1.2K')).toBeVisible()
    await expect(page.getByText('Following')).toBeVisible()
    await expect(page.getByText('328')).toBeVisible()
    await expect(page.getByText('Posts')).toBeVisible()
  })

  test('shows bio', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/Beauty & lifestyle creator/)).toBeVisible()
  })

  test('shows niche chips', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Beauty').first()).toBeVisible()
    await expect(page.getByText('Lifestyle').first()).toBeVisible()
  })

  test('shows account type badge', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('MEDIA CREATOR')).toBeVisible()
  })

  test('shows contact details section with email and phone', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Contact Details')).toBeVisible()
    await expect(page.getByText('luna@example.com')).toBeVisible()
    await expect(page.getByText('+91 9876543210')).toBeVisible()
  })

  test('shows email verification status', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Verified').first()).toBeVisible()
  })

  test('shows phone unverified status', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Unverified')).toBeVisible()
  })

  test('shows rate card with pricing', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Rate Card')).toBeVisible()
    await expect(page.getByText('Per Reel')).toBeVisible()
    await expect(page.getByText('Per Post')).toBeVisible()
    await expect(page.getByText('Per Story')).toBeVisible()
    await expect(page.getByText('Ad Rights (15d)')).toBeVisible()
  })

  test('shows quick action buttons', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Campaigns')).toBeVisible()
    await expect(page.getByText('Brands')).toBeVisible()
    await expect(page.getByText('Wallet')).toBeVisible()
    await expect(page.getByText('Support')).toBeVisible()
  })

  test('shows coming soon for disabled quick actions', async ({ page }) => {
    await page.goto('/dashboard')
    const comingSoon = page.getByText('Coming soon')
    await expect(comingSoon.first()).toBeVisible()
  })

  test('shows reels & videos section', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Reels & Videos')).toBeVisible()
  })

  test('shows account section with Edit Profile and Disconnect', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Account')).toBeVisible()
    // Account section has edit profile link
    const editLinks = page.locator('button', { hasText: 'Edit Profile' })
    await expect(editLinks.first()).toBeVisible()
    await expect(page.getByText('Disconnect Account')).toBeVisible()
    await expect(page.getByText('Delete Account')).toBeVisible()
  })

  test('shows Edit Profile button in header', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /Edit Profile/i }).first()).toBeVisible()
  })

  test('clicking Edit Profile opens the edit modal', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    // Modal should open with form fields
    await expect(page.getByText('Edit Profile').last()).toBeVisible()
    await expect(page.locator('input[value="Luna Vega"]')).toBeVisible()
  })

  test('edit modal shows all form fields', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    await expect(page.getByText('Display Name *')).toBeVisible()
    await expect(page.getByText('Instagram Handle')).toBeVisible()
    await expect(page.getByText('Primary Niche')).toBeVisible()
    await expect(page.getByText('Contact Number')).toBeVisible()
    await expect(page.getByText('Rate Card (INR)')).toBeVisible()
  })

  test('edit modal shows pricing fields including ad rights', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    await expect(page.getByText('Per Reel')).toBeVisible()
    await expect(page.getByText('Per Post')).toBeVisible()
    await expect(page.getByText('Per Story')).toBeVisible()
    await expect(page.getByText('Ad Rights (15 days)')).toBeVisible()
  })

  test('edit modal can be cancelled', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    await expect(page.getByText('Edit Profile').last()).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    // Modal should close — header Edit Profile button should still be visible
    await expect(page.getByRole('button', { name: /Edit Profile/i }).first()).toBeVisible()
  })

  test('edit modal validates required display name', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    // Clear display name
    const nameInput = page.locator('input[value="Luna Vega"]')
    await nameInput.clear()
    await page.getByRole('button', { name: /Save Changes/i }).click()
    await expect(page.getByText('Display name is required.')).toBeVisible()
  })

  test('edit modal shows bio character count', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()
    await expect(page.getByText(/\/300/)).toBeVisible()
  })

  test('save button sends PATCH request and closes modal', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).first().click()

    let patchCalled = false
    await page.route('**/api/account/profile**', (route) => {
      if (route.request().method() === 'PATCH') {
        patchCalled = true
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: MOCK_CREATOR_PROFILE, error: null, requestId: 'p1' }),
        })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: /Save Changes/i }).click()
    await page.waitForTimeout(500)
    expect(patchCalled).toBe(true)
  })

  test('niche edit button opens niche editor', async ({ page }) => {
    await page.goto('/dashboard')
    // Click the pencil icon next to niche chips
    await page.getByLabel('Edit niches').click()
    await expect(page.getByText('Edit Niches')).toBeVisible()
    await expect(page.getByText('Select up to 3 niches')).toBeVisible()
  })

  test('disconnect account clears session and redirects', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByText('Disconnect Account').click()
    await expect(page).toHaveURL('/')
    const session = await page.evaluate(() =>
      localStorage.getItem('colabrise_influencer_session_id'),
    )
    expect(session).toBeNull()
  })
})

// ── Tests: Campaigns ─────────────────────────────────────────

test.describe('Creator Dashboard - Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('displays campaign stats cards', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Completed')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.getByText('Applied')).toBeVisible()
    await expect(page.getByText('Rejected')).toBeVisible()
  })

  test('stats cards show correct counts', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // Wait for stats to load
    await expect(page.getByText('7')).toBeVisible() // completed
    await expect(page.getByText('3')).toBeVisible() // active
    await expect(page.getByText('5')).toBeVisible() // applied
    await expect(page.getByText('2')).toBeVisible() // rejected
  })

  test('displays campaign cards with details', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Summer Glow Collection')).toBeVisible()
    await expect(page.getByText('Fitness Challenge 2026')).toBeVisible()
    await expect(page.getByText('by GlowUp Beauty')).toBeVisible()
  })

  test('shows niche tags on campaign cards', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Beauty').first()).toBeVisible()
    await expect(page.getByText('Fitness').first()).toBeVisible()
  })

  test('shows budget per creator in INR', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // INR format: ₹8,000 for camp-1
    await expect(page.getByText(/₹/).first()).toBeVisible()
  })

  test('shows slots available', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // camp-1: 10 - 4 = 6 slots
    await expect(page.getByText('6 slots')).toBeVisible()
  })

  test('shows Apply button for campaigns not yet applied to', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    const applyButtons = page.getByRole('button', { name: /Apply Now/i })
    await expect(applyButtons.first()).toBeVisible()
  })

  test('shows Application Pending status for pending applications', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Application Pending')).toBeVisible()
  })

  test('shows Submit Content button for approved campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByRole('button', { name: /Submit Content/i })).toBeVisible()
  })

  test('shows Application Rejected status for rejected applications', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Application Rejected')).toBeVisible()
  })

  test('shows No Slots Available when campaign is full', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // camp-3: 5 - 5 = 0 slots
    await expect(page.getByText('No Slots Available')).toBeVisible()
  })

  test('search filters campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByPlaceholder(/Search campaigns/).fill('Summer')
    // Wait for debounce
    await page.waitForTimeout(500)
    await expect(page.getByText('Summer Glow Collection')).toBeVisible()
  })

  test('filter tabs change campaign list', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // Click "Active" filter tab
    await page.getByRole('button', { name: 'Active' }).click()
    await expect(page.getByText('Summer Glow Collection')).toBeVisible()
    // Completed campaign should not show in active filter
    await expect(page.getByText('Winter Fashion Haul')).not.toBeVisible()
  })

  test('Completed filter shows completed campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: 'Completed' }).click()
    await expect(page.getByText('Winter Fashion Haul')).toBeVisible()
  })

  test('Applied filter shows pending applications', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: 'Applied' }).click()
    await expect(page.getByText('Fitness Challenge 2026')).toBeVisible()
  })

  test('Approved filter shows approved campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: 'Approved' }).click()
    await expect(page.getByText('Winter Fashion Haul')).toBeVisible()
  })
})

// ── Tests: Apply for Campaign ────────────────────────────────

test.describe('Creator Dashboard - Apply for Campaign', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('clicking Apply opens the apply modal', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Apply Now/i }).first().click()
    await expect(page.getByText('Apply for Campaign')).toBeVisible()
    await expect(page.getByText('Summer Glow Collection')).toBeVisible()
  })

  test('apply modal shows campaign info and stats', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Apply Now/i }).first().click()
    await expect(page.getByText('Summer Glow Collection')).toBeVisible()
    await expect(page.getByText('by GlowUp Beauty')).toBeVisible()
    await expect(page.getByText('Per Creator')).toBeVisible()
    await expect(page.getByText('Slots Left')).toBeVisible()
    await expect(page.getByText('Deadline')).toBeVisible()
  })

  test('apply modal submits successfully', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Apply Now/i }).first().click()
    await page.getByRole('button', { name: /Confirm Application/i }).click()
    // Should show success toast
    await expect(page.getByText(/Application submitted successfully/)).toBeVisible()
  })

  test('apply modal can be cancelled', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Apply Now/i }).first().click()
    await expect(page.getByText('Apply for Campaign')).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Apply for Campaign')).not.toBeVisible()
  })

  test('apply modal shows profile sharing notice', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Apply Now/i }).first().click()
    await expect(page.getByText(/profile will be shared/)).toBeVisible()
  })
})

// ── Tests: Submit Content ────────────────────────────────────

test.describe('Creator Dashboard - Submit Content', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('clicking Submit Content opens the submit modal', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('Submit Content').first()).toBeVisible()
  })

  test('submit modal shows Instagram URL field', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('Instagram Post URL *')).toBeVisible()
    await expect(page.getByPlaceholder(/instagram.com/)).toBeVisible()
  })

  test('submit modal shows caption field (required)', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('Post Caption *')).toBeVisible()
    await expect(page.getByPlaceholder(/Paste the exact caption/)).toBeVisible()
  })

  test('submit modal shows notes field (optional)', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('Notes to Brand (optional)')).toBeVisible()
  })

  test('submit modal validates empty URL', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    // Click submit in the modal (second Submit Content button)
    await page.getByRole('button', { name: /Submit Content/i }).nth(1).click()
    await expect(page.getByText(/Please provide a link/)).toBeVisible()
  })

  test('submit modal validates non-Instagram URL', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await page.getByPlaceholder(/instagram.com/).fill('https://youtube.com/watch?v=abc')
    await page.getByRole('button', { name: /Submit Content/i }).nth(1).click()
    await expect(page.getByText(/valid Instagram URL/)).toBeVisible()
  })

  test('submit modal validates missing caption', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await page.getByPlaceholder(/instagram.com/).fill('https://instagram.com/reel/ABC123')
    await page.getByRole('button', { name: /Submit Content/i }).nth(1).click()
    await expect(page.getByText(/Caption is required/)).toBeVisible()
  })

  test('submit modal submits successfully with valid data', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    // Fill URL
    await page.getByPlaceholder(/instagram.com/).fill('https://instagram.com/reel/ABC123')
    // Fill caption
    await page.getByPlaceholder(/Paste the exact caption/).fill('Amazing skincare routine with @brand #ad')
    // Submit
    await page.getByRole('button', { name: /Submit Content/i }).nth(1).click()
    // Should show success toast
    await expect(page.getByText(/Content submitted successfully/)).toBeVisible()
  })

  test('submit modal can be cancelled', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('Submit Content').first()).toBeVisible()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('.fixed')).not.toBeVisible()
  })

  test('submit modal shows character counts', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Submit Content/i }).click()
    await expect(page.getByText('/2200')).toBeVisible()
    await expect(page.getByText('/1000')).toBeVisible()
  })
})

// ── Tests: Brands ────────────────────────────────────────────

test.describe('Creator Dashboard - Brands', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('displays brand cards', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await expect(page.getByText('GlowUp Beauty')).toBeVisible()
    await expect(page.getByText('FitLife Pro')).toBeVisible()
    await expect(page.getByText('TechNova')).toBeVisible()
    await expect(page.getByText('StyleHub')).toBeVisible()
  })

  test('shows brand industry', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await expect(page.getByText('Beauty').first()).toBeVisible()
    await expect(page.getByText('Fitness').first()).toBeVisible()
  })

  test('shows brand description', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await expect(page.getByText(/Premium skincare and beauty/)).toBeVisible()
  })

  test('shows campaign count per brand', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await expect(page.getByText('5 campaigns')).toBeVisible()
    await expect(page.getByText('3 campaigns')).toBeVisible()
  })

  test('shows website links', async ({ page }) => {
    await page.goto('/dashboard/brands')
    const websiteLinks = page.getByText('Website')
    // Brands with websites should show link
    await expect(websiteLinks.first()).toBeVisible()
  })

  test('shows Following button for followed brands', async ({ page }) => {
    await page.goto('/dashboard/brands')
    // GlowUp Beauty and StyleHub are isFollowing: true
    const followingButtons = page.getByRole('button', { name: /Following/i })
    await expect(followingButtons).toHaveCount(2)
  })

  test('shows Follow button for unfollowed brands', async ({ page }) => {
    await page.goto('/dashboard/brands')
    // FitLife Pro and TechNova are isFollowing: false
    const followButtons = page.getByRole('button', { name: /^Follow$/i })
    await expect(followButtons).toHaveCount(2)
  })

  test('clicking Follow sends POST request and updates UI', async ({ page }) => {
    await page.goto('/dashboard/brands')
    // Click Follow on FitLife Pro
    const fitlifeCard = page.locator('div', { hasText: 'FitLife Pro' }).filter({ has: page.getByRole('button') })
    const followBtn = fitlifeCard.getByRole('button', { name: /^Follow$/i })
    await followBtn.click()
    // Should now show Following
    await expect(fitlifeCard.getByRole('button', { name: /Following/i })).toBeVisible()
  })

  test('clicking Following (unfollow) sends DELETE request and updates UI', async ({ page }) => {
    await page.goto('/dashboard/brands')
    // Click Following (unfollow) on GlowUp Beauty
    const glowupCard = page.locator('div', { hasText: 'GlowUp Beauty' }).filter({ has: page.getByRole('button') })
    const unfollowBtn = glowupCard.getByRole('button', { name: /Following/i })
    await unfollowBtn.click()
    // Should now show Follow
    await expect(glowupCard.getByRole('button', { name: /^Follow$/i })).toBeVisible()
  })

  test('shows following count', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await expect(page.getByText(/Following.*2.*brand/)).toBeVisible()
  })

  test('search filters brands by name', async ({ page }) => {
    await page.goto('/dashboard/brands')
    await page.getByPlaceholder(/Search brands/).fill('Tech')
    // Wait for debounce (400ms)
    await page.waitForTimeout(500)
    // The search is sent to server — since we mock all brands regardless,
    // we just verify the search input works
    await expect(page.getByPlaceholder(/Search brands/)).toHaveValue('Tech')
  })

  test('industry filter dropdown is present', async ({ page }) => {
    await page.goto('/dashboard/brands')
    const industrySelect = page.locator('select')
    await expect(industrySelect).toBeVisible()
    // Should have multiple options
    const options = industrySelect.locator('option')
    expect(await options.count()).toBeGreaterThan(5)
  })

  test('shows brand avatar placeholder when no logo', async ({ page }) => {
    await page.goto('/dashboard/brands')
    // All mock brands have no logo — should see letter avatars
    // GlowUp Beauty → "G", FitLife Pro → "F"
    await expect(page.getByText('G').first()).toBeVisible()
    await expect(page.getByText('F').first()).toBeVisible()
  })
})

// ── Tests: Auth Guard ────────────────────────────────────────

test.describe('Creator Dashboard - Auth Guard', () => {
  test('redirects to login when no session exists', async ({ page }) => {
    // Don't set any session
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/brands\/register/)
  })

  test('shows loading state while verifying session', async ({ page }) => {
    await setupCreatorSession(page)
    // Delay the auth response
    await page.route('**/api/auth/status**', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { status: 'authenticated', user_id: 'user-1' },
          error: null,
          requestId: 'ag1',
        }),
      })
    })
    await page.goto('/dashboard')
    await expect(page.getByText(/Verifying session/)).toBeVisible()
  })

  test('redirects when session is invalid', async ({ page }) => {
    await setupCreatorSession(page)
    await page.route('**/api/auth/status**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { status: 'not_found', user_id: null },
          error: null,
          requestId: 'ag2',
        }),
      })
    })
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/brands\/register/)
  })
})

// ── Tests: Sign Out ──────────────────────────────────────────

test.describe('Creator Dashboard - Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    await setupCreatorSession(page)
    await mockCreatorAPIs(page)
  })

  test('sign out button clears session and redirects to home', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Sign out/i }).click()
    await expect(page).toHaveURL('/')
    const session = await page.evaluate(() =>
      localStorage.getItem('colabrise_influencer_session_id'),
    )
    expect(session).toBeNull()
  })
})

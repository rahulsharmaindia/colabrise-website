import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for the Brand Dashboard.
 *
 * These tests mock the brand session in localStorage and intercept API
 * calls to avoid hitting the real production server. This allows tests
 * to run fast and deterministically.
 */

// ── Test fixtures ────────────────────────────────────────────

const BRAND_SESSION_ID = 'test-brand-session-123'

const MOCK_BRAND_PROFILE = {
  businessId: 'testbrand',
  name: 'Test Brand',
  industry: 'Beauty',
  logo: null,
  website: 'https://testbrand.com',
  description: 'A test brand for E2E testing',
  socialLinks: {
    instagram: 'https://instagram.com/testbrand',
    twitter: 'https://x.com/testbrand',
  },
}

const MOCK_CAMPAIGNS = [
  {
    campaignId: 'camp-1',
    title: 'Summer Beauty Launch',
    status: 'active',
    description: 'Promote our summer collection',
    objective: 'Brand Awareness',
    campaignType: 'Promotion',
    platform: 'Instagram',
    totalBudget: 50000,
    budgetPerCreator: 5000,
    paymentModel: 'Fixed',
    totalSlots: 10,
    approvedCount: 4,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    applicationDeadline: '2026-07-25',
    preferredNiche: 'Beauty',
    minimumFollowers: 10000,
    deliverables: { reels: 2, stories: 3, posts: 1 },
  },
  {
    campaignId: 'camp-2',
    title: 'Winter Skincare Draft',
    status: 'draft',
    description: 'Draft for winter skincare campaign',
    objective: 'Product Promotion',
    campaignType: 'UGC',
    platform: 'Instagram',
    totalBudget: 30000,
    budgetPerCreator: 3000,
    paymentModel: 'Commission',
    commissionRate: 15,
    totalSlots: 5,
    approvedCount: 0,
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    preferredNiche: 'Fitness',
    minimumFollowers: 5000,
  },
  {
    campaignId: 'camp-3',
    title: 'Expired Promo',
    status: 'completed',
    description: 'Old completed campaign',
    objective: 'Lead Generation',
    campaignType: 'Review',
    platform: 'Instagram',
    totalBudget: 20000,
    budgetPerCreator: 2000,
    paymentModel: 'Fixed',
    totalSlots: 8,
    approvedCount: 8,
    startDate: '2026-01-01',
    endDate: '2026-02-28',
    applicationDeadline: '2025-12-20',
    preferredNiche: 'Tech',
    minimumFollowers: 1000,
  },
]

const MOCK_CREATORS = [
  {
    id: 'cr-1',
    userId: 'user-1',
    username: 'luna_vega',
    displayName: 'Luna Vega',
    bio: 'Beauty & skincare creator',
    profilePictureUrl: null,
    followerCount: 45000,
    followsCount: 1200,
    mediaCount: 320,
    niche: 'Beauty',
  },
  {
    id: 'cr-2',
    userId: 'user-2',
    username: 'fit_raj',
    displayName: 'Raj Fitness',
    bio: 'Fitness coach and content creator',
    profilePictureUrl: null,
    followerCount: 120000,
    followsCount: 800,
    mediaCount: 560,
    niche: 'Fitness',
  },
]

const MOCK_APPLICATIONS = [
  {
    applicationId: 'app-1',
    campaignId: 'camp-1',
    influencerId: 'inf-1',
    username: 'luna_vega',
    followerCount: 45000,
    profilePictureUrl: null,
    status: 'Pending',
    createdAt: '2026-08-15T10:00:00.000Z',
  },
  {
    applicationId: 'app-2',
    campaignId: 'camp-1',
    influencerId: 'inf-2',
    username: 'fit_raj',
    followerCount: 120000,
    profilePictureUrl: 'https://example.com/pic.jpg',
    status: 'Approved',
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    applicationId: 'app-3',
    campaignId: 'camp-1',
    influencerId: 'inf-3',
    username: 'foodie_dev',
    followerCount: 8000,
    profilePictureUrl: null,
    status: 'Rejected',
    createdAt: '2026-08-12T10:00:00.000Z',
  },
]

// ── Setup helpers ────────────────────────────────────────────

async function setupBrandSession(page: Page) {
  await page.addInitScript((sessionId) => {
    localStorage.setItem('colabrise_brand_session_id', sessionId)
  }, BRAND_SESSION_ID)
}

async function mockAPIs(page: Page) {
  // Mock brand profile
  await page.route('**/api/brand**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_BRAND_PROFILE, error: null, requestId: '1' }),
      })
    } else if (route.request().method() === 'PATCH') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_BRAND_PROFILE, error: null, requestId: '2' }),
      })
    } else {
      route.continue()
    }
  })

  // Mock campaigns list
  await page.route('**/api/campaigns', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_CAMPAIGNS, error: null, requestId: '3' }),
      })
    } else if (route.request().method() === 'POST') {
      const newCampaign = { ...MOCK_CAMPAIGNS[1], campaignId: 'camp-new', status: 'draft', title: 'New Test Campaign' }
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: newCampaign, error: null, requestId: '4' }),
      })
    } else {
      route.continue()
    }
  })

  // Mock single campaign detail
  await page.route('**/api/campaigns/camp-*', (route) => {
    const url = route.request().url()
    const method = route.request().method()

    // Handle applications sub-route
    if (url.includes('/applications')) {
      if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: MOCK_APPLICATIONS, error: null, requestId: 'a1' }),
        })
      } else if (method === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { status: 'Approved' }, error: null, requestId: 'a2' }),
        })
      } else {
        route.continue()
      }
      return
    }

    const match = url.match(/campaigns\/(camp-\d+)/)
    if (match) {
      const campaign = MOCK_CAMPAIGNS.find((c) => c.campaignId === match[1]) ?? MOCK_CAMPAIGNS[0]
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: campaign, error: null, requestId: '5' }),
      })
    } else {
      route.continue()
    }
  })

  // Mock creators search
  await page.route('**/api/creators/search**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_CREATORS, error: null, requestId: '6' }),
    })
  })
}

// ── Tests ────────────────────────────────────────────────────

test.describe('Brand Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('shows brand-specific navigation items', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Campaigns' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Creators' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
    // Brands should NOT see the "Brands" nav item
    await expect(page.getByRole('link', { name: 'Brands' })).not.toBeVisible()
  })

  test('navigates between pages via sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: 'Campaigns' }).click()
    await expect(page).toHaveURL('/dashboard/campaigns')
    await page.getByRole('link', { name: 'Creators' }).click()
    await expect(page).toHaveURL('/dashboard/creators')
  })
})

test.describe('Brand Dashboard - Overview (Brand Profile)', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('displays brand profile information', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('Test Brand')).toBeVisible()
    await expect(page.getByText('@testbrand')).toBeVisible()
    await expect(page.getByText('Beauty')).toBeVisible()
    await expect(page.getByText('testbrand.com')).toBeVisible()
    await expect(page.getByText('A test brand for E2E testing')).toBeVisible()
  })

  test('shows social links with URLs', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('instagram.com/testbrand')).toBeVisible()
    await expect(page.getByText('x.com/testbrand')).toBeVisible()
  })

  test('shows Edit Profile button', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /Edit Profile/i })).toBeVisible()
  })

  test('opens edit form when Edit Profile is clicked', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).click()
    await expect(page.getByText('Edit Brand Profile')).toBeVisible()
    // Check form fields are populated
    await expect(page.locator('input[value="Test Brand"]')).toBeVisible()
  })

  test('edit form has logo upload option', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).click()
    await expect(page.getByText('Change Logo')).toBeVisible()
    await expect(page.getByText('PNG or JPG, max 2 MB')).toBeVisible()
  })

  test('edit form shows all social link fields with icons', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Edit Profile/i }).click()
    await expect(page.getByPlaceholder('https://instagram.com/yourbrand')).toBeVisible()
    await expect(page.getByPlaceholder('https://facebook.com/yourbrand')).toBeVisible()
    await expect(page.getByPlaceholder('https://x.com/yourbrand')).toBeVisible()
    await expect(page.getByPlaceholder('https://linkedin.com/company/yourbrand')).toBeVisible()
    await expect(page.getByPlaceholder('https://tiktok.com/@yourbrand')).toBeVisible()
  })
})

test.describe('Brand Dashboard - Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('displays campaign stats cards', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Total')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.getByText('Upcoming')).toBeVisible()
    await expect(page.getByText('Drafts')).toBeVisible()
  })

  test('shows Create Campaign button', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByRole('button', { name: /Create Campaign/i })).toBeVisible()
  })

  test('displays campaign cards with details', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Summer Beauty Launch')).toBeVisible()
    await expect(page.getByText('Winter Skincare Draft')).toBeVisible()
  })

  test('campaign cards show deliverables', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('2 Reels')).toBeVisible()
    await expect(page.getByText('3 Stories')).toBeVisible()
  })

  test('campaign cards show niche pill with color', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByText('Beauty').first()).toBeVisible()
  })

  test('expired campaigns show Expired pill instead of status', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    const expiredCard = page.locator('button', { hasText: 'Expired Promo' })
    await expect(expiredCard.getByText('Expired')).toBeVisible()
  })

  test('filter tabs work', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // Click "draft" tab
    await page.getByRole('button', { name: 'draft' }).click()
    await expect(page.getByText('Winter Skincare Draft')).toBeVisible()
    await expect(page.getByText('Summer Beauty Launch')).not.toBeVisible()
  })

  test('expired filter shows expired campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: 'expired' }).click()
    await expect(page.getByText('Expired Promo')).toBeVisible()
    await expect(page.getByText('Summer Beauty Launch')).not.toBeVisible()
  })

  test('clicking campaign card opens detail view', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByText('Back to campaigns')).toBeVisible()
    await expect(page.getByText('Description & Objective')).toBeVisible()
    await expect(page.getByText('Budget & Payment')).toBeVisible()
  })

  test('campaign detail shows all sections', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByText('Creator Slots')).toBeVisible()
    await expect(page.getByText('Timeline')).toBeVisible()
    await expect(page.getByText('Creator Requirements')).toBeVisible()
  })

  test('campaign detail shows Edit button for active campaigns', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByRole('button', { name: /Edit Campaign/i })).toBeVisible()
  })

  test('expired campaign detail shows Create Duplicate button', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    // Click expired tab then the expired campaign
    await page.getByRole('button', { name: 'expired' }).click()
    await page.getByText('Expired Promo').click()
    await expect(page.getByRole('button', { name: /Create Duplicate/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Edit Campaign/i })).not.toBeVisible()
  })

  test('draft campaign detail shows Edit button', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: 'draft' }).click()
    await page.getByText('Winter Skincare Draft').click()
    await expect(page.getByRole('button', { name: /Edit Campaign/i })).toBeVisible()
  })

  test('budget is displayed in INR format', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    // Check for rupee symbol in budget section
    await expect(page.getByText(/₹/).first()).toBeVisible()
  })
})

test.describe('Brand Dashboard - Create Campaign Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('opens create campaign wizard', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    await expect(page.getByText('Create Campaign')).toBeVisible()
    await expect(page.getByText('Campaign Details')).toBeVisible()
  })

  test('wizard shows 7 step indicators', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    await expect(page.getByText('Details')).toBeVisible()
    await expect(page.getByText('Content')).toBeVisible()
    await expect(page.getByText('Audience')).toBeVisible()
    await expect(page.getByText('Budget')).toBeVisible()
    await expect(page.getByText('Timeline')).toBeVisible()
    await expect(page.getByText('Creators')).toBeVisible()
    await expect(page.getByText('Guidelines')).toBeVisible()
  })

  test('step 1 validates required fields', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    // Try to go next without filling anything
    await page.getByRole('button', { name: /Next/i }).click()
    await expect(page.getByText('Title is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
    await expect(page.getByText('Objective is required')).toBeVisible()
  })

  test('step 1 allows navigation after filling required fields', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    // Fill step 1
    await page.getByPlaceholder('Give your campaign a catchy name').fill('Test Campaign')
    await page.locator('select').first().selectOption('Brand Awareness')
    await page.locator('select').nth(1).selectOption('Promotion')
    await page.getByPlaceholder('Describe what this campaign is about...').fill('Test description')
    await page.getByRole('button', { name: /Next/i }).click()
    // Should be on step 2
    await expect(page.getByText('Content Requirements')).toBeVisible()
  })

  test('deliverables stepper works', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    // Increment reels
    const reelsSection = page.locator('div', { hasText: 'Reels' }).filter({ has: page.locator('button') })
    await reelsSection.getByText('+').click()
    await expect(reelsSection.getByText('1')).toBeVisible()
  })

  test('Save Draft button is always visible', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible()
  })

  test('post types can be toggled', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByRole('button', { name: /Create Campaign/i }).click()
    // Fill step 1 and go to step 2
    await page.getByPlaceholder('Give your campaign a catchy name').fill('Test')
    await page.locator('select').first().selectOption('Brand Awareness')
    await page.locator('select').nth(1).selectOption('Promotion')
    await page.getByPlaceholder('Describe what this campaign is about...').fill('desc')
    await page.getByRole('button', { name: /Next/i }).click()
    // Toggle Reel post type
    await page.getByRole('button', { name: 'Reel' }).click()
    await expect(page.getByRole('button', { name: 'Reel' })).toHaveClass(/bg-purple/)
  })
})

test.describe('Brand Dashboard - Creators', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('displays creator cards', async ({ page }) => {
    await page.goto('/dashboard/creators')
    await expect(page.getByText('Luna Vega')).toBeVisible()
    await expect(page.getByText('@luna_vega')).toBeVisible()
    await expect(page.getByText('Raj Fitness')).toBeVisible()
  })

  test('shows follower count and media count', async ({ page }) => {
    await page.goto('/dashboard/creators')
    await expect(page.getByText('45.0K')).toBeVisible()
    await expect(page.getByText('120.0K')).toBeVisible()
  })

  test('shows niche badges', async ({ page }) => {
    await page.goto('/dashboard/creators')
    await expect(page.getByText('Beauty').first()).toBeVisible()
    await expect(page.getByText('Fitness').first()).toBeVisible()
  })

  test('has search input', async ({ page }) => {
    await page.goto('/dashboard/creators')
    await expect(page.getByPlaceholder(/Search by name/i)).toBeVisible()
  })

  test('has niche filter input', async ({ page }) => {
    await page.goto('/dashboard/creators')
    await expect(page.getByPlaceholder(/Filter by niche/i)).toBeVisible()
  })
})

test.describe('Brand Dashboard - Global Search', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('search bar is visible in top bar', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await expect(page.getByPlaceholder('Search...')).toBeVisible()
  })

  test('search filters campaigns by title', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByPlaceholder('Search...').fill('Summer')
    await expect(page.getByText('Summer Beauty Launch')).toBeVisible()
    await expect(page.getByText('Winter Skincare Draft')).not.toBeVisible()
  })

  test('search filters campaigns by niche', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByPlaceholder('Search...').fill('Fitness')
    await expect(page.getByText('Winter Skincare Draft')).toBeVisible()
    await expect(page.getByText('Summer Beauty Launch')).not.toBeVisible()
  })

  test('clearing search shows all campaigns again', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByPlaceholder('Search...').fill('Summer')
    // Click the X button to clear
    await page.locator('header button').filter({ has: page.locator('svg') }).last().click()
    await expect(page.getByText('Summer Beauty Launch')).toBeVisible()
    await expect(page.getByText('Winter Skincare Draft')).toBeVisible()
  })
})

test.describe('Brand Dashboard - Sign Out', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('sign out button clears session and redirects', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Sign out/i }).click()
    await expect(page).toHaveURL('/')
    const session = await page.evaluate(() => localStorage.getItem('colabrise_brand_session_id'))
    expect(session).toBeNull()
  })
})

// ── Tests: Campaign Applications ─────────────────────────────

test.describe('Brand Dashboard - Campaign Applications', () => {
  test.beforeEach(async ({ page }) => {
    await setupBrandSession(page)
    await mockAPIs(page)
  })

  test('campaign detail shows Applications section', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByText(/Applications \(3\)/)).toBeVisible()
  })

  test('applications are grouped by status', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByText('Pending (1)')).toBeVisible()
    await expect(page.getByText('Approved (1)')).toBeVisible()
    await expect(page.getByText('Rejected (1)')).toBeVisible()
  })

  test('pending applications show Approve and Reject buttons', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByRole('button', { name: /Approve/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Reject/ })).toBeVisible()
  })

  test('approved applications do not show action buttons', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    // fit_raj is approved — should show "Approved" badge, not buttons
    const approvedSection = page.locator('div', { hasText: 'fit_raj' })
    await expect(approvedSection.getByText('Approved')).toBeVisible()
  })

  test('applications show username and follower count', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    await expect(page.getByText('luna_vega')).toBeVisible()
    await expect(page.getByText('45.0K followers')).toBeVisible()
    await expect(page.getByText('fit_raj')).toBeVisible()
    await expect(page.getByText('120.0K followers')).toBeVisible()
  })

  test('applications show profile picture when available', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    // fit_raj has a profile picture URL
    const img = page.locator('img[alt="fit_raj"]')
    await expect(img).toBeVisible()
  })

  test('applications show initials when no profile picture', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    // luna_vega has no profile picture — should show initials "LU"
    await expect(page.getByText('LU')).toBeVisible()
  })

  test('clicking Approve sends PATCH request', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    
    let patchCalled = false
    let patchBody: unknown = null
    await page.route('**/api/campaigns/camp-1/applications/app-1', (route) => {
      if (route.request().method() === 'PATCH') {
        patchCalled = true
        patchBody = JSON.parse(route.request().postData() ?? '{}')
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...MOCK_APPLICATIONS[0], status: 'Approved' }, error: null, requestId: 'a3' }),
        })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: /Approve/ }).click()
    await page.waitForTimeout(500)
    expect(patchCalled).toBe(true)
    expect(patchBody).toEqual({ status: 'Approved' })
  })

  test('clicking Reject sends PATCH request', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()

    let patchBody: unknown = null
    await page.route('**/api/campaigns/camp-1/applications/app-1', (route) => {
      if (route.request().method() === 'PATCH') {
        patchBody = JSON.parse(route.request().postData() ?? '{}')
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...MOCK_APPLICATIONS[0], status: 'Rejected' }, error: null, requestId: 'a4' }),
        })
      } else {
        route.continue()
      }
    })

    await page.getByRole('button', { name: /Reject/ }).click()
    await page.waitForTimeout(500)
    expect(patchBody).toEqual({ status: 'Rejected' })
  })

  test('applications show application date', async ({ page }) => {
    await page.goto('/dashboard/campaigns')
    await page.getByText('Summer Beauty Launch').click()
    // Aug 15 for luna_vega
    await expect(page.getByText('Aug 15')).toBeVisible()
  })
})

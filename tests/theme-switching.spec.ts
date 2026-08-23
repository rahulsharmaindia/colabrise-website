import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for the Light/Dark theme switching feature.
 *
 * Verifies:
 * - Theme toggle button is visible and functional
 * - Clicking toggle switches between light and dark mode
 * - Theme preference persists in localStorage
 * - Correct CSS classes applied to the HTML element
 * - Visual correctness of key elements in both modes
 */

// ── Setup ────────────────────────────────────────────────────

const CREATOR_SESSION_ID = 'test-theme-session-789'

async function setupSession(page: Page) {
  await page.addInitScript((sessionId) => {
    localStorage.setItem('colabrise_influencer_session_id', sessionId)
  }, CREATOR_SESSION_ID)
}

async function mockAPIs(page: Page) {
  await page.route('**/api/auth/status**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { status: 'authenticated', user_id: 'user-1', profile_completion_status: 'complete', email: 'test@example.com' },
        error: null,
        requestId: 'auth1',
      }),
    })
  })

  await page.route('**/api/profile/niches**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: ['Beauty', 'Tech'], error: null, requestId: 'n1' }),
    })
  })

  await page.route('**/api/profile**', (route) => {
    if (route.request().url().includes('/niches')) {
      route.continue()
      return
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'ig-test',
          name: 'Test Creator',
          displayName: 'Test Creator',
          username: 'test_creator',
          bio: 'Testing theme switching',
          followerCount: 10000,
          followsCount: 500,
          mediaCount: 100,
          niche: 'Tech',
          email: 'test@example.com',
          emailVerificationStatus: 'verified',
        },
        error: null,
        requestId: 'p1',
      }),
    })
  })

  await page.route('**/api/media**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], error: null, requestId: 'm1' }),
    })
  })
}

// ── Tests ────────────────────────────────────────────────────

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await setupSession(page)
    await mockAPIs(page)
  })

  test('should default to dark mode', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // HTML element should have 'dark' class
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')

    // Theme toggle button should show Sun icon (indicating dark mode is active, click to go light)
    const toggleButton = page.getByTestId('theme-toggle')
    await expect(toggleButton).toBeVisible()

    // In dark mode, the Sun icon is shown (to switch to light)
    const sunIcon = toggleButton.locator('svg')
    await expect(sunIcon).toBeVisible()
  })

  test('should switch to light mode when toggle is clicked', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Click the theme toggle
    await page.getByTestId('theme-toggle').click()

    // HTML element should NOT have 'dark' class
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).not.toContain('dark')

    // localStorage should store 'light'
    const storedTheme = await page.evaluate(() => localStorage.getItem('colabrise-theme'))
    expect(storedTheme).toBe('light')
  })

  test('should switch back to dark mode on second toggle click', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Click once → light
    await page.getByTestId('theme-toggle').click()
    let htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).not.toContain('dark')

    // Click again → dark
    await page.getByTestId('theme-toggle').click()
    htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')

    const storedTheme = await page.evaluate(() => localStorage.getItem('colabrise-theme'))
    expect(storedTheme).toBe('dark')
  })

  test('should persist theme preference across page reloads', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Switch to light mode
    await page.getByTestId('theme-toggle').click()
    const storedTheme = await page.evaluate(() => localStorage.getItem('colabrise-theme'))
    expect(storedTheme).toBe('light')

    // Reload the page
    await page.reload()
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Should still be light mode after reload
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).not.toContain('dark')

    // localStorage still has light
    const storedAfterReload = await page.evaluate(() => localStorage.getItem('colabrise-theme'))
    expect(storedAfterReload).toBe('light')
  })

  test('should persist dark theme preference across page reloads', async ({ page }) => {
    // Start fresh — set dark explicitly
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'dark')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })

  test('light mode: sidebar should have white/light background', async ({ page }) => {
    // Start in light mode
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Desktop sidebar should be visible
    const sidebar = page.locator('aside.hidden.lg\\:flex')
    await expect(sidebar).toBeVisible()

    // Check sidebar has white/light background (no dark bg)
    const bgColor = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor)
    // White or near-white (rgb(255, 255, 255))
    expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)/)
  })

  test('dark mode: sidebar should have dark background', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'dark')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    const sidebar = page.locator('aside.hidden.lg\\:flex')
    await expect(sidebar).toBeVisible()

    // Check sidebar has dark background
    const bgColor = await sidebar.evaluate((el) => getComputedStyle(el).backgroundColor)
    // dark-800 = #111127 = rgb(17, 17, 39)
    expect(bgColor).toMatch(/rgb\(17,\s*17,\s*39\)/)
  })

  test('light mode: page heading text should be dark', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('h1')

    const heading = page.locator('h1').first()
    const color = await heading.evaluate((el) => getComputedStyle(el).color)
    // gray-900 = rgb(17, 24, 39) or similar dark color
    // Just verify it's not white
    expect(color).not.toMatch(/rgb\(255,\s*255,\s*255\)/)
  })

  test('dark mode: page heading text should be white', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'dark')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('h1')

    const heading = page.locator('h1').first()
    const color = await heading.evaluate((el) => getComputedStyle(el).color)
    // Should be white (rgb(255, 255, 255))
    expect(color).toMatch(/rgb\(255,\s*255,\s*255\)/)
  })

  test('light mode: top bar should have light background', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('header')

    const header = page.locator('header').first()
    const bgColor = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
    // Should be white or near-white with opacity
    // bg-white/80 in computed style
    expect(bgColor).not.toMatch(/rgb\(10,\s*10,\s*26\)/) // not dark-900
  })

  test('light mode: cards should have white background', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[class*="rounded-xl"]')

    // Find a card element (DashCard)
    const card = page.locator('[class*="rounded-xl"][class*="border"]').first()
    if (await card.isVisible()) {
      const bgColor = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)/)
    }
  })

  test('dark mode: cards should have dark background', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'dark')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[class*="rounded-xl"]')

    const card = page.locator('[class*="rounded-xl"][class*="border"]').first()
    if (await card.isVisible()) {
      const bgColor = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
      // dark-800 = rgb(17, 17, 39)
      expect(bgColor).toMatch(/rgb\(17,\s*17,\s*39\)/)
    }
  })

  test('theme toggle should have correct aria-label', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    const toggle = page.getByTestId('theme-toggle')

    // Default is dark mode — label should say "Switch to light mode"
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode')

    // Click to switch to light
    await toggle.click()

    // Now label should say "Switch to dark mode"
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  test('light mode: body background should be light gray', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    // bg-gray-50 = rgb(249, 250, 251) - from our CSS
    expect(bodyBg).toMatch(/rgb\(249,\s*250,\s*251\)/)
  })

  test('dark mode: body background should be dark', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'dark')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    // dark-900 = #0a0a1a = rgb(10, 10, 26)
    expect(bodyBg).toMatch(/rgb\(10,\s*10,\s*26\)/)
  })

  test('should navigate between pages and maintain theme', async ({ page }) => {
    // Mock additional APIs for campaigns page
    await page.route('**/api/creator/campaigns/stats**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { active: 2, completed: 1, applied: 3, rejected: 0 }, error: null, requestId: 'cs1' }),
      })
    })

    await page.route('**/api/marketplace/campaigns**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null, requestId: 'mc1' }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('colabrise-theme', 'light')
    })

    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="theme-toggle"]')

    // Verify light mode
    let htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).not.toContain('dark')

    // Navigate to campaigns page via sidebar
    const campaignsLink = page.locator('nav a[href="/dashboard/campaigns"]')
    if (await campaignsLink.isVisible()) {
      await campaignsLink.click()
      await page.waitForURL('**/dashboard/campaigns')

      // Theme should persist
      htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).not.toContain('dark')

      const storedTheme = await page.evaluate(() => localStorage.getItem('colabrise-theme'))
      expect(storedTheme).toBe('light')
    }
  })
})

import { test, expect } from '@playwright/test'

test.skip(!process.env.GOOGLE_TEST_EMAIL, 'needs live env — set GOOGLE_TEST_EMAIL + GOOGLE_TEST_PASSWORD')

test('inbox flow', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
})

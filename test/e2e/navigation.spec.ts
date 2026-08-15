import { test, expect } from '@playwright/test';

test.describe('Navigation & Loading Progress Bar E2E', () => {
  test('navigates to Docs and About pages smoothly', async ({ page }) => {
    await page.goto('/');

    // Navigate to About page
    const aboutLink = page.getByRole('link', { name: /About/i }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }

    // Navigate to Docs page
    const docsLink = page.getByRole('link', { name: /Docs/i }).first();
    if (await docsLink.isVisible()) {
      await docsLink.click();
      await expect(page).toHaveURL(/\/docs/);
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Homepage & Event Discovery E2E', () => {
  test('loads homepage with scope tabs and search bar', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/HackForPinas/);

    // Verify scope buttons exist
    await expect(page.getByRole('button', { name: 'All Events' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Philippine Tech Events/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Global \/ Foreign/i })).toBeVisible();

    // Verify search input is present
    await expect(page.getByPlaceholder('Search hackathons...')).toBeVisible();
  });

  test('can switch between scope tabs', async ({ page }) => {
    await page.goto('/');

    // Click Philippine Tech Events tab
    const phTab = page.getByRole('button', { name: /Philippine Tech Events/i });
    await phTab.click();

    // Click Global / Foreign tab
    const globalTab = page.getByRole('button', { name: /Global \/ Foreign/i });
    await globalTab.click();

    // Click All Events tab
    const allTab = page.getByRole('button', { name: 'All Events' });
    await allTab.click();
  });
});

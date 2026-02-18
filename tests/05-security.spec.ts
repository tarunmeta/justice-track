import { test, expect } from '@playwright/test';

test.describe('Phase 11: Security & Role-Based Access', () => {

    test('11.1 Unauthorized Admin Access Attempt', async ({ page }) => {
        await page.goto('/admin');
        // Should redirect or show 403
        await expect(page).toHaveURL(/.*login|.*dashboard/);
    });

    test('11.2 XSS Attempt in Case Search', async ({ page }) => {
        await page.goto('/cases');
        const searchInput = page.locator('input[placeholder*="Search"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('<script>alert("XSS")</script>');
            await page.keyboard.press('Enter');

            // Ensure no alert happened (Playwright handles dialogs automatically, but we check if it survived)
            await expect(page.locator('text=Search Results')).toBeVisible();
        }
    });

    test('11.3 SQL Injection Attempt in Login', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input[placeholder="you@example.com"]', "' OR '1'='1");
        await page.fill('input[placeholder="••••••••"]', 'password');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
});

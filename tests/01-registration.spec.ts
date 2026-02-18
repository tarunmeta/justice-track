import { test, expect } from '@playwright/test';

const TEST_USER = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
};

test.describe('Phase 1 & 2: Registration & OTP Verification', () => {

    test('1.1 Successful Registration Flow', async ({ page }) => {
        await page.goto('/auth/register');

        // Setup response listener before action
        const registerResponsePromise = page.waitForResponse(r =>
            r.url().includes('/auth/register') && (r.status() === 200 || r.status() === 201)
        );

        // Fill registration form using fixed locators
        await page.fill('input[name="name"]', TEST_USER.name);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.fill('input[name="confirmPassword"]', TEST_USER.password);
        await page.selectOption('select', 'USER');
        await page.check('input[id="legal-affirmation"]');

        await page.click('button:has-text("Create Account")');

        const registerRes = await registerResponsePromise;
        const { devOtp } = await registerRes.json();

        // Verify OTP screen appears
        await expect(page.locator('text=Verify Email')).toBeVisible({ timeout: 10000 });

        // Fill OTP
        await page.fill('input[placeholder="000000"]', devOtp.trim());
        await page.click('button:has-text("Verify Email")');

        // Verify redirect to login
        await expect(page).toHaveURL(/.*login/);
    });

    test('1.2 Field-Level Validation (Empty Fields)', async ({ page }) => {
        await page.goto('/auth/register');
        await page.click('button:has-text("Create Account")');

        // Browsers handle 'required' validation, so we check if we're still on the same page
        await expect(page).toHaveURL(/.*register/);
    });

    test('2.2 Incorrect OTP Edge Case', async ({ page }) => {
        await page.goto('/auth/register');

        const tempEmail = `fail_${Date.now()}@example.com`;
        await page.fill('input[name="name"]', 'Fail User');
        await page.fill('input[name="email"]', tempEmail);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password123!');
        await page.check('input[id="legal-affirmation"]');
        await page.click('button:has-text("Create Account")');

        await expect(page.locator('text=Verify Email')).toBeVisible();

        // Fill wrong OTP
        await page.fill('input[placeholder="000000"]', '000000');
        await page.click('button:has-text("Verify Email")');

        // Verify error message
        await expect(page.locator('text=Verification failed')).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';

const TEST_USER = {
    email: `case_test_${Date.now()}@example.com`,
    password: 'Password123!',
};

test.describe('Phase 5 & 6: Case Lifecycle', () => {

    test.beforeEach(async ({ page }) => {
        // Register and verify user
        await page.goto('/auth/register');

        const registerResponsePromise = page.waitForResponse(r =>
            r.url().includes('/auth/register') && (r.status() === 200 || r.status() === 201)
        );

        await page.fill('input[name="name"]', 'Case Tester');
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.fill('input[name="confirmPassword"]', TEST_USER.password);
        await page.check('input[id="legal-affirmation"]');
        await page.click('button:has-text("Create Account")');

        const registerRes = await registerResponsePromise;
        const { devOtp } = await registerRes.json();

        await page.fill('input[placeholder="000000"]', devOtp.trim());
        await page.click('button:has-text("Verify Email")');

        // Login
        await expect(page).toHaveURL(/.*login/);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('5.1 Valid Case Submission', async ({ page }) => {
        await page.goto('/cases/create');

        const caseTitle = `E2E Verified Case - ${Date.now()}`;
        await page.fill('#case-title', caseTitle);
        await page.fill('#case-description', 'Detailed factual description for testing case submission. It meets the minimum length requirements.');
        await page.selectOption('#case-category', 'OTHER');
        await page.fill('#case-location', 'New Delhi, India');
        await page.fill('#reference-number', `FIR/${Date.now()}/TEST`);

        await page.click('button:has-text("Submit for Review")');
        await expect(page.locator('text=Case submitted for review!')).toBeVisible();
    });

    test('6.1 Moderator Approval Flow', async ({ page }) => {
        const caseTitle = `Mod-Test Case - ${Date.now()}`;
        await page.goto('/cases/create');
        await page.fill('#case-title', caseTitle);
        await page.fill('#case-description', 'Case to be approved by moderator.');
        await page.selectOption('#case-category', 'OTHER');
        await page.fill('#case-location', 'Delhi');
        await page.fill('#reference-number', `FIR/${Date.now()}/MOD`);
        await page.click('button:has-text("Submit for Review")');

        const { execSync } = require('child_process');
        execSync(`npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.update({ where: { email: '${TEST_USER.email}' }, data: { role: 'MODERATOR' } }).then(() => process.exit(0))"`, { cwd: 'c:/Users/tarun saini/justice system/server' });

        await page.goto('/moderate');
        await expect(page.locator('text=Pending Cases')).toBeVisible();
        await page.click(`button:has-text("Approve"):near(:text("${caseTitle}"))`);
        await expect(page.locator('text=Case approved successfully')).toBeVisible();
    });
});

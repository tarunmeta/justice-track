import { test, expect } from '@playwright/test';

const TEST_USER = {
    email: `interact_test_${Date.now()}@example.com`,
    password: 'Password123!',
};

test.describe('Phase 7 & 8: Interactions', () => {

    test.beforeEach(async ({ page }) => {
        // Quick setup: Register, Verify, Login
        await page.goto('/auth/register');

        const registerResponsePromise = page.waitForResponse(r =>
            r.url().includes('/auth/register') && (r.status() === 200 || r.status() === 201)
        );

        await page.fill('input[name="name"]', 'Interact Tester');
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.fill('input[name="confirmPassword"]', TEST_USER.password);
        await page.check('input[id="legal-affirmation"]');
        await page.click('button:has-text("Create Account")');

        const registerRes = await registerResponsePromise;
        const { devOtp } = await registerRes.json();

        await page.fill('input[placeholder="000000"]', devOtp.trim());
        await page.click('button:has-text("Verify Email")');

        await expect(page).toHaveURL(/.*login/);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
    });

    test('7.1 Voting System - Support Case', async ({ page }) => {
        const caseTitle = `Vote-Safe Case - ${Date.now()}`;
        const { execSync } = require('child_process');
        const script = `
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const user = await p.user.findUnique({ where: { email: '${TEST_USER.email}' } });
    await p.case.create({
        data: {
            title: '${caseTitle}',
            description: 'Case for voting test',
            category: 'OTHER',
            location: 'India',
            status: 'VERIFIED',
            authorId: user.id,
            referenceNumber: 'REF-' + Date.now()
        }
    });
}
run().then(() => process.exit(0));
`;
        execSync(`npx ts-node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { cwd: 'c:/Users/tarun saini/justice system/server' });

        await page.goto('/cases');
        await page.click(`text=${caseTitle}`);

        await expect(page.locator('button:has-text("Support Case")')).toBeVisible();
        await page.click('button:has-text("Support Case")');
        await expect(page.locator('text=Support recorded')).toBeVisible();

        // Test double vote prevention
        await page.click('button:has-text("Support Case")');
        await expect(page.locator('text=already supported')).toBeVisible();
    });

    test('8.1 Lawyer Comment Flow', async ({ page }) => {
        const { execSync } = require('child_process');
        execSync(`npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.update({ where: { email: '${TEST_USER.email}' }, data: { role: 'LAWYER' } }).then(() => process.exit(0))"`, { cwd: 'c:/Users/tarun saini/justice system/server' });

        await page.goto('/cases');
        await page.locator('text=E2E Verified').first().click();

        await page.fill('textarea[placeholder*="legal explanation"]', 'Professional legal insight for this case.');
        await page.click('button:has-text("Submit Explanation")');
        await expect(page.locator('text=Lawyer explanation added')).toBeVisible();
    });
});

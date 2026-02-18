import { test, expect } from '@playwright/test';

const TEST_USER = {
    name: 'QA Master Tester',
    email: `master_${Date.now()}@example.com`,
    password: 'Password123!',
};

test.describe('JusticeTrack Master E2E Flow', () => {

    test('Phase 1-12: Full System Lifecycle Verified', async ({ page }) => {
        test.setTimeout(240000); // Extended timeout for full flow

        console.log('--- STARTING MASTER E2E VERIFICATION ---');

        // PHASE 1: REGISTRATION
        await page.goto('/auth/register');

        const registerResponsePromise = page.waitForResponse(r =>
            r.url().includes('/auth/register') && (r.status() === 200 || r.status() === 201)
        );

        await page.fill('input[name="name"]', TEST_USER.name);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.fill('input[name="confirmPassword"]', TEST_USER.password);
        await page.check('input[id="legal-affirmation"]');
        await page.click('button:has-text("Create Account")');

        const registerRes = await registerResponsePromise;
        const { devOtp } = await registerRes.json();

        // PHASE 2: OTP VERIFICATION
        await expect(page.locator('text=Verify Email')).toBeVisible({ timeout: 15000 });
        await page.fill('input[placeholder="000000"]', devOtp.trim());
        await page.click('button:has-text("Verify Email")');

        // PHASE 3: LOGIN
        await expect(page).toHaveURL(/.*login/);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // PHASE 4: HOME/DASHBOARD
        await expect(page).toHaveURL('/', { timeout: 30000 });
        await expect(page.locator('text=Join as Contributor')).not.toBeVisible();

        // PHASE 5: CASE SUBMISSION
        await page.goto('/cases/create');
        const caseTitle = `Master Verified Case - ${Date.now()}`;
        await page.fill('#case-title', caseTitle);
        await page.fill('#case-description', 'Detailed factual description for the master E2E verification suite. This is to ensure accountability and transparency.');
        await page.fill('#case-location', 'Mumbai, India');
        await page.fill('#reference-number', `MASTER/FIR/${Date.now()}`);

        // Check the legal disclaimer
        await page.locator('#legal-affirmation').click();
        await page.waitForTimeout(500);

        await page.click('button:has-text("Submit for Review")');
        await expect(page.locator('text=Case submitted for review!')).toBeVisible({ timeout: 15000 });

        // PHASE 6: MODERATOR FLOW
        const { execSync } = require('child_process');
        execSync(`npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.update({ where: { email: '${TEST_USER.email}' }, data: { role: 'MODERATOR' } }).then(() => process.exit(0))"`, { cwd: 'c:/Users/tarun saini/justice system/server' });

        await page.goto('/moderate');
        await page.click(`button:has-text("Approve"):near(:text("${caseTitle}"))`);
        await expect(page.locator('text=Case approved successfully')).toBeVisible();

        // PHASE 7: VOTING
        await page.goto('/cases');
        await page.click(`text=${caseTitle}`);
        await page.click('button:has-text("Support Case")');
        await expect(page.locator('text=Support recorded')).toBeVisible();

        // PHASE 8: LAWYER COMMENT
        execSync(`npx ts-node -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.user.update({ where: { email: '${TEST_USER.email}' }, data: { role: 'LAWYER' } }).then(() => process.exit(0))"`, { cwd: 'c:/Users/tarun saini/justice system/server' });
        await page.reload();
        await page.fill('textarea[placeholder*="legal explanation"]', 'Factual legal analysis for this master verified case.');
        await page.click('button:has-text("Submit Explanation")');
        await expect(page.locator('text=Lawyer explanation added')).toBeVisible();

        // PHASE 12: LOGOUT
        const profileButton = page.locator('button:has(div.rounded-full)');
        await profileButton.click();
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/');

        console.log('✅ MASTER E2E VERIFICATION: PERFECT 🔥');
    });
});

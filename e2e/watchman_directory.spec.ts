import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Watchman Student Directory and Gate Verification E2E Suite', () => {
  test.beforeAll(() => {
    try {
      execSync('& "c:\\Data\\Inter Assign\\backend\\venv\\Scripts\\python.exe" seed_data.py', {
        cwd: 'c:\\Data\\Inter Assign\\backend',
        shell: 'powershell.exe',
      });
    } catch (e) {
      console.error('Failed to seed database before Watchman E2E test:', e);
    }
  });

  test('Watchman Dashboard Directory, Filters, Search, and Movement Validation', async ({ page }) => {
    // 1. Login as Watchman
    await page.goto('/login');
    await page.fill('input[type="email"]', 'watchman@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/watchman\/dashboard/);
    await expect(page.locator('h1:has-text("Main Gate Security Desk")')).toBeVisible();

    // 2. Verify Today's Authorized Outings section exists
    await expect(page.locator('h2:has-text("Today\'s Authorized Outings")')).toBeVisible();

    // 3. Verify All Students directory section exists
    await expect(page.locator('h2:has-text("All Students")')).toBeVisible();

    // 4. Verify all 3 seeded students appear in directory
    await expect(page.locator('td:has-text("Arjun Raj")').first()).toBeVisible();
    await expect(page.locator('td:has-text("Nithya S")').first()).toBeVisible();
    await expect(page.locator('td:has-text("Rahul Menon")').first()).toBeVisible();

    // 5. Test Register Number Search
    await page.fill('input[placeholder*="Register Number"]', 'CSE2027001');
    await page.click('button:has-text("Search")');
    await expect(page.locator('td:has-text("Arjun Raj")').first()).toBeVisible();

    // Clear search
    await page.click('button:has-text("Clear Search")');
    await expect(page.locator('td:has-text("Nithya S")').first()).toBeVisible();

    // 6. Test Outing ID Search (#OUT-3)
    await page.fill('input[placeholder*="Register Number"]', '#OUT-3');
    await page.click('button:has-text("Search")');
    await expect(page.locator('td:has-text("#OUT-3")').first()).toBeVisible();

    // Clear search
    await page.click('button:has-text("Clear Search")');
    await expect(page.locator('td:has-text("Rahul Menon")').first()).toBeVisible();

    // 7. Open Student View Modal for Rahul Menon (C Block Student - Outing #OUT-3 APPROVED)
    await page.click('tr:has-text("CSE2027002") button:has-text("View Student")');

    // Verify Modal details
    await expect(page.locator('h3:has-text("Rahul Menon")')).toBeVisible();
    await expect(page.locator('text=Reg No: CSE2027002')).toBeVisible();
    await expect(page.locator('text=Active / Recent Outing Record')).toBeVisible();
    await expect(page.locator('text=#OUT-3').first()).toBeVisible();

    // Record Exit inside Modal for Approved Outing #OUT-3
    await page.click('div.fixed button:has-text("Record Exit")');
    await expect(page.locator('text=Gate Exit recorded successfully')).toBeVisible();

    // Verify status updated to Exited inside Modal
    await expect(page.locator('div.fixed button:has-text("Record Return")')).toBeVisible();

    // Record Return inside Modal
    await page.click('div.fixed button:has-text("Record Return")');
    await expect(page.locator('text=Gate Return recorded successfully')).toBeVisible();

    // Close Modal
    await page.click('div.fixed button:has-text("Close")');
  });
});

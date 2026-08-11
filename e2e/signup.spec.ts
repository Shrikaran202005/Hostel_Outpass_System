import { test, expect } from '@playwright/test';

test.describe('Student Signup & Registration E2E Flow', () => {
  test('Student Registration, Login, and Scope Verification', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueEmail = `arjun.e2e.${timestamp}@student-demo.local`;
    const uniqueRegNum = `REG${timestamp.toString().slice(-6)}`;
    const studentName = `Arjun E2E ${timestamp.toString().slice(-4)}`;
    const password = 'Password123!';

    // 1. Open Login Page
    await page.goto('/login');
    await expect(page.locator('h1').first()).toContainText('College Hostel Outing Portal');

    // 2. Click "Create New Account"
    await page.click('text=Create New Account');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator('h1').first()).toContainText('System Account Registration');

    // 3. Fill Student Registration Form
    await page.fill('input[placeholder*="Arjun"]', studentName);
    await page.fill('input[placeholder*="CSE2027005"]', uniqueRegNum);
    await page.fill('input[type="email"]', uniqueEmail);

    // Password & Confirm Password
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    // Select Academic Year, Department & Hostel Block
    const selects = page.locator('select');
    await selects.nth(1).selectOption('3');
    await selects.nth(2).selectOption({ index: 1 });
    await selects.nth(3).selectOption({ index: 1 });

    // Room Number
    await page.fill('input[placeholder*="C-204"]', 'A-305');

    // 4. Submit Registration
    await page.click('button:has-text("Create STUDENT Account")');

    // 5. Verify successful registration & redirect to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.locator('text=Account created successfully as STUDENT')).toBeVisible();

    // 6. Login with newly created student
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign In")');

    // 7. Verify Student Dashboard
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1:has-text("Student Outing Dashboard")')).toBeVisible();

    // 8. Verify Student Name & Block
    await expect(page.locator(`text=${studentName}`)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('New Hostel Block & Multi-Role Signup Scenario (C Block Workflow)', () => {
  test.beforeAll(() => {
    // Reset database to initial seed state
    try {
      execSync('& "c:\\Data\\Inter Assign\\backend\\venv\\Scripts\\python.exe" seed_data.py', {
        cwd: 'c:\\Data\\Inter Assign\\backend',
        shell: 'powershell.exe',
      });
    } catch (e) {
      console.error('Failed to seed data before test:', e);
    }
  });

  const timestamp = Date.now();
  const studentEmail = `karthik.cblock_${timestamp}@test.local`;
  const studentReg = `CBLK${timestamp.toString().slice(-6)}`;

  test('Complete C Block onboarding and approval workflow', async ({ page }) => {
    // 1. Open signup page
    await page.goto('/signup');
    await expect(page.locator('h1').first()).toContainText('System Account Registration');

    // 2. Select Student account type and register C Block Student
    const studentSelects = page.locator('select');
    await studentSelects.nth(0).selectOption('STUDENT');

    await page.fill('input[placeholder*="Arjun"]', 'Karthik Raj');
    await page.fill('input[type="email"]', studentEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123!');
    await passwordInputs.nth(1).fill('Password123!');

    await page.fill('input[placeholder*="CSE2027005"]', studentReg);
    await studentSelects.nth(1).selectOption('3');
    await studentSelects.nth(2).selectOption({ index: 1 });
    await studentSelects.nth(3).selectOption({ label: 'C Block' });
    await page.fill('input[placeholder*="C-204"]', 'C-204');

    await page.click('button:has-text("Create STUDENT Account")');

    // 3. Verify success redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Account created successfully as STUDENT')).toBeVisible();

    // 4. Login with new C Block Student
    await page.fill('input[type="email"]', studentEmail);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button:has-text("Sign In")');

    // 5. Verify Student Dashboard profile
    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.locator('text=Karthik Raj')).toBeVisible();
    await expect(page.locator('text=C Block').first()).toBeVisible();

    // 6. Create Outing Request
    await page.click('button:has-text("New Outing Request")');
    await page.fill('input[placeholder*="City Mall"]', 'Bookstore');
    await page.fill('textarea[placeholder*="specific reason"]', 'Academic textbooks');
    await page.click('button:has-text("Submit Request")');

    // Verify request submitted with status Pending HOD
    await expect(page.locator('span:has-text("Pending HOD")')).toBeVisible();

    // 7. Logout student
    await page.click('button[title="Sign Out"]');

    // 8. Login as CSE HOD to approve
    await page.fill('input[type="email"]', 'hod.cse@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/hod\/dashboard/);
    await page.click(`tr:has-text("${studentReg}") button:has-text("Approve")`);
    await page.fill('textarea', 'HOD approval granted.');
    await page.click('button:has-text("Confirm Approval")');

    // 9. Verify request is cleared from HOD pending queue
    await expect(page.locator(`tr:has-text("${studentReg}")`)).not.toBeVisible();

    // 10. Logout HOD
    await page.click('button[title="Sign Out"]');

    // 11. Login as C Block Warden (Mr. Suresh Kumar)
    await page.fill('input[type="email"]', 'warden.c@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/warden\/dashboard/);
    await expect(page.locator('text=Mr. Suresh Kumar')).toBeVisible();
    await expect(page.locator('text=C Block').first()).toBeVisible();

    // 12. Verify pending request from C Block student appears on Warden dashboard
    await expect(page.locator(`tr:has-text("${studentReg}")`)).toBeVisible();

    // 13. Confirm parent approval and grant final approval
    await page.click(`tr:has-text("${studentReg}") button:has-text("Process Request")`);
    await page.click('input[type="checkbox"]');
    await page.fill('textarea', 'Parent consent verified via phone call. Final approval granted.');
    await page.click('button:has-text("Final Approve Outing")');

    // 14. Verify final status is cleared on Warden dashboard
    await expect(page.locator('text=All Warden approvals cleared!')).toBeVisible();
  });
});

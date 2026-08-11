import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('HOD & Warden Role-Scoped Outing History E2E Suite', () => {
  test.beforeAll(() => {
    try {
      execSync('& "c:\\Data\\Inter Assign\\backend\\venv\\Scripts\\python.exe" seed_data.py', {
        cwd: 'c:\\Data\\Inter Assign\\backend',
        shell: 'powershell.exe',
      });
    } catch (e) {
      console.error('Failed to seed database before Role History E2E test:', e);
    }
  });

  test('TEST 1: CSE HOD sees CSE students (Arjun, Rahul) and NOT ECE student (Nithya)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hod.cse@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/hod\/dashboard/);
    await page.click('a:has-text("History")');
    await expect(page).toHaveURL(/\/hod\/history/);

    await expect(page.locator('h1:has-text("Outing History")')).toBeVisible();
    await expect(page.locator('text=Department: Computer Science and Engineering')).toBeVisible();

    // Verify Arjun Raj (CSE) and Rahul Menon (CSE) are visible
    await expect(page.locator('td:has-text("Arjun Raj")')).toBeVisible();
    await expect(page.locator('td:has-text("Rahul Menon")')).toBeVisible();

    // Verify Nithya S (ECE) is NOT visible
    await expect(page.locator('td:has-text("Nithya S")')).not.toBeVisible();
  });

  test('TEST 2: ECE HOD sees ECE student (Nithya) and NOT CSE students (Arjun, Rahul)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hod.ece@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/hod\/dashboard/);
    await page.click('a:has-text("History")');
    await expect(page).toHaveURL(/\/hod\/history/);

    await expect(page.locator('h1:has-text("Outing History")')).toBeVisible();
    await expect(page.locator('text=Department: Electronics and Communication Engineering')).toBeVisible();

    // Verify Nithya S (ECE) is visible
    await expect(page.locator('td:has-text("Nithya S")')).toBeVisible();

    // Verify Arjun Raj and Rahul Menon are NOT visible
    await expect(page.locator('td:has-text("Arjun Raj")')).not.toBeVisible();
    await expect(page.locator('td:has-text("Rahul Menon")')).not.toBeVisible();
  });

  test('TEST 3: C Block Warden sees C Block student (Rahul) and NOT A/B Block students', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'warden.c@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/warden\/dashboard/);
    await page.click('a:has-text("History")');
    await expect(page).toHaveURL(/\/warden\/history/);

    await expect(page.locator('h1:has-text("Outing History")')).toBeVisible();
    await expect(page.locator('text=Hostel Block: C Block')).toBeVisible();

    // Verify Rahul Menon (C Block) is visible
    await expect(page.locator('td:has-text("Rahul Menon")')).toBeVisible();

    // Verify Arjun Raj (A Block) and Nithya S (B Block) are NOT visible
    await expect(page.locator('td:has-text("Arjun Raj")')).not.toBeVisible();
    await expect(page.locator('td:has-text("Nithya S")')).not.toBeVisible();
  });

  test('TEST 4: A Block Warden sees A Block student (Arjun) and NOT B/C Block students', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'warden.a@hostelapp.local');
    await page.fill('input[type="password"]', 'Hostel@123');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/warden\/dashboard/);
    await page.click('a:has-text("History")');
    await expect(page).toHaveURL(/\/warden\/history/);

    await expect(page.locator('h1:has-text("Outing History")')).toBeVisible();
    await expect(page.locator('text=Hostel Block: A Block')).toBeVisible();

    // Verify Arjun Raj (A Block) is visible
    await expect(page.locator('td:has-text("Arjun Raj")')).toBeVisible();

    // Verify Rahul Menon (C Block) and Nithya S (B Block) are NOT visible
    await expect(page.locator('td:has-text("Rahul Menon")')).not.toBeVisible();
    await expect(page.locator('td:has-text("Nithya S")')).not.toBeVisible();
  });
});

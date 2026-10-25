import { test, expect } from '@playwright/test';

test.describe('Public Navigation - Guest User', () => {
  test('should navigate between public pages without login', async ({ page }) => {
    await page.goto('/');

    // Navigate to Map
    await page.getByRole('link', { name: /Peta Laporan/i }).first().click();
    await expect(page).toHaveURL(/\/map/);
    
    // Navigate to Budget (APBD)
    await page.getByRole('link', { name: /Anggaran APBD/i }).first().click();
    await expect(page).toHaveURL(/\/budget/);
    
    // Navigate back to Home
    await page.getByRole('link', { name: /Beranda/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('should show "Masuk" link for guest users in navbar', async ({ page }) => {
    await page.goto('/');

    // Check "Masuk" link is visible
    await expect(page.getByRole('link', { name: /^Masuk$/i })).toBeVisible();
  });

  test('should redirect to login when guest clicks "Lapor Masalah"', async ({ page }) => {
    await page.goto('/');

    // Click "Lapor Masalah" CTA
    await page.getByRole('link', { name: /Mulai Lapor Masalah/i }).click();
    
    // Should redirect to login with next parameter
    await expect(page).toHaveURL(/\/login/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile menu button exists
    const menuButton = page.getByLabel(/Buka menu|Menu/i);
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Check navigation links in mobile menu
    await expect(page.getByRole('link', { name: /Beranda/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Peta Laporan/i })).toBeVisible();
  });
});

test.describe('Public Navigation - Authenticated User', () => {
  // Note: This test assumes you have a way to authenticate
  // You may need to implement a login helper or use API authentication
  
  test.skip('should show profile link and logout button for authenticated users', async ({ page }) => {
    // TODO: Implement authentication flow
    // await authenticateUser(page, 'test@example.com', 'password');
    
    await page.goto('/');
    
    // Check profile link is visible
    await expect(page.getByRole('link', { name: /Profil/i })).toBeVisible();
    
    // Check logout button is visible (desktop)
    await expect(page.getByRole('button', { name: /Keluar/i })).toBeVisible();
  });

  test.skip('should allow direct access to /report/new when authenticated', async ({ page }) => {
    // TODO: Implement authentication flow
    // await authenticateUser(page, 'test@example.com', 'password');
    
    await page.goto('/report/new');
    
    // Should not redirect to login
    await expect(page).toHaveURL('/report/new');
  });
});

test.describe('Public Navigation - Admin User', () => {
  test.skip('should show admin dashboard link for admin users', async ({ page }) => {
    // TODO: Implement admin authentication flow
    // await authenticateUser(page, 'admin@example.com', 'password');
    
    await page.goto('/');
    
    // Check admin dashboard link is visible
    await expect(page.getByRole('link', { name: /Dashboard Admin/i })).toBeVisible();
  });

  test.skip('should allow access to /admin for admin users', async ({ page }) => {
    // TODO: Implement admin authentication flow
    // await authenticateUser(page, 'admin@example.com', 'password');
    
    await page.goto('/admin');
    
    // Should not redirect to unauthorized
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText(/Dashboard Admin/i)).toBeVisible();
  });
});

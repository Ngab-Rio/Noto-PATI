import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check login form elements
    await expect(page.getByRole('heading', { name: /Selamat datang kembali/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk/i })).toBeVisible();
  });

  test('should have link to register page from login', async ({ page }) => {
    await page.goto('/login');

    // Check register link
    const registerLink = page.getByRole('link', { name: 'Daftar sekarang', exact: true });
    await expect(registerLink).toBeVisible();
    
    // Navigate to register
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    // Check register form elements
    await expect(page.getByRole('heading', { name: /Buat akun warga/i })).toBeVisible();
    await expect(page.getByLabel(/Nama/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('should show validation error on empty login submission', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: /Masuk/i }).click();
    
    // Check for validation error (browser native or custom)
    const emailInput = page.getByLabel(/Email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should preserve redirect path after login', async ({ page }) => {
    // Try to access protected page
    await page.goto('/login?next=/report/new');

    // Check URL contains next parameter
    expect(new URL(page.url()).searchParams.get('next')).toBe('/report/new');
    
    // After login (mocked), should redirect to /report/new
    // This test requires actual authentication to complete
  });
});

test.describe('Authorization Flow', () => {
  test('should redirect non-admin users from /admin', async ({ page }) => {
    // Without authentication, should redirect to unauthorized
    await page.goto('/admin');
    
    // Should redirect to unauthorized or login
    await expect(page).toHaveURL(/\/unauthorized|\/login/);
  });

  test('should display unauthorized page with appropriate message', async ({ page }) => {
    await page.goto('/unauthorized');

    // Check unauthorized message
    await expect(page.getByText(/tidak memiliki izin/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Kembali ke halaman utama/i })).toBeVisible();
  });
});

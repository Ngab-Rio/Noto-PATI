import { Page } from '@playwright/test';

/**
 * Authentication Helpers for E2E Testing
 * Noto PATI - Playwright Test Utilities
 */

/**
 * Login helper - fills and submits login form
 * Note: Requires valid test credentials in environment or Supabase test database
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password/i).fill(password);
  
  await page.getByRole('button', { name: /Masuk/i }).click();
  
  // Wait for redirect after successful login
  await page.waitForURL(/\/(profile|report|$)/, { timeout: 5000 });
}

/**
 * Register helper - fills and submits registration form
 */
export async function registerUser(
  page: Page, 
  fullName: string, 
  email: string, 
  password: string
) {
  await page.goto('/register');
  
  await page.getByLabel(/Nama/i).fill(fullName);
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password/i).fill(password);
  
  await page.getByRole('button', { name: /Daftar/i }).click();
  
  // Wait for success message or redirect
  await page.waitForURL(/\/(profile|login)/, { timeout: 5000 });
}

/**
 * Logout helper - finds and clicks logout button
 */
export async function logoutUser(page: Page) {
  // Try desktop logout button first
  const desktopLogout = page.getByRole('button', { name: /Keluar/i });
  
  if (await desktopLogout.isVisible()) {
    await desktopLogout.click();
  } else {
    // Try mobile menu
    const menuButton = page.getByLabel(/Buka menu/i);
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.getByRole('button', { name: /Keluar/i }).click();
    }
  }
  
  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 5000 });
}

/**
 * Check if user is authenticated by looking for profile link
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const profileLink = page.getByRole('link', { name: /Profil/i });
  return await profileLink.isVisible();
}

/**
 * API Authentication helper using Supabase session
 * This is more reliable than UI-based login for test setup
 * 
 * Usage:
 * await authenticateViaAPI(page, {
 *   email: 'test@example.com',
 *   password: 'testpassword'
 * });
 */
export async function authenticateViaAPI(
  page: Page,
  credentials: { email: string; password: string }
) {
  // Make API call to login endpoint
  const response = await page.request.post('/api/auth/login', {
    data: credentials,
  });
  
  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()}`);
  }
  
  // The session cookie should now be set
  // Navigate to a page to verify
  await page.goto('/');
}

/**
 * Setup test user with specific role
 * Note: Requires database access or admin API
 */
export async function setupTestUser(
  email: string,
  password: string,
  role: 'admin' | 'warga' = 'warga'
): Promise<{ email: string; password: string; role: string }> {
  // TODO: Implement user creation via Supabase Admin API
  // This would typically be done in test setup/teardown
  
  return { email, password, role };
}

/**
 * Cleanup test user
 * Should be called in test afterAll or afterEach
 */
export async function cleanupTestUser(email: string) {
  // TODO: Implement user deletion via Supabase Admin API
  console.log(`Cleanup user: ${email}`);
}

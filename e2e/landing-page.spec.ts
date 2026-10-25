import { test, expect } from '@playwright/test';

test.describe('Landing Page - Public Access', () => {
  test('should display landing page with all required elements', async ({ page }) => {
    await page.goto('/');

    // Check hero section
    await expect(page.getByRole('heading', { name: /Perhatian kecil, perubahan yang terasa/i })).toBeVisible();
    
    // Check tagline
    await expect(page.getByText(/Noto PATI membantu warga/i)).toBeVisible();
    
    // Check CTAs
    await expect(page.getByRole('link', { name: /Mulai Lapor Masalah/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Lihat Peta Laporan/i })).toBeVisible();
  });

  test('should display "How to Report" section with 5 steps', async ({ page }) => {
    await page.goto('/');

    // Check section heading
    await expect(page.getByRole('heading', { name: /Cara Melaporkan Masalah/i })).toBeVisible();
    
    // Check all 5 steps are visible
    await expect(page.getByText(/Foto masalah/i)).toBeVisible();
    await expect(page.getByText(/Tandai lokasi/i)).toBeVisible();
    await expect(page.getByText(/Isi deskripsi/i)).toBeVisible();
    await expect(page.getByText(/Kirim laporan/i)).toBeVisible();
    await expect(page.getByText(/Pantau status/i)).toBeVisible();
  });

  test('should display status badges showcase', async ({ page }) => {
    await page.goto('/');

    // Check section heading
    await expect(page.getByRole('heading', { name: /Status Laporan Warga Real-time/i })).toBeVisible();
    
    // Check Data Simulasi badge
    await expect(page.getByText(/Data Simulasi/i)).toBeVisible();
    
    // Check at least some status badges are visible
    await expect(page.getByText(/Diterima/i).first()).toBeVisible();
    await expect(page.getByText(/Diproses/i).first()).toBeVisible();
  });

  test('should display featured reports with mock data indicator', async ({ page }) => {
    await page.goto('/');

    // Check featured reports are displayed
    const reportCards = page.locator('article').filter({ hasText: /Penerangan|Tanggul/i });
    await expect(reportCards.first()).toBeVisible();
  });

  test('should display footer with disclaimers', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer disclaimers
    await expect(page.getByText(/Bukan situs resmi pemerintah/i)).toBeVisible();
    await expect(page.getByText(/Data APBD bersumber/i)).toBeVisible();
  });

  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/');

    // Check main navigation links
    await expect(page.getByRole('link', { name: /Beranda/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Peta Laporan/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Anggaran APBD/i })).toBeVisible();
  });
});

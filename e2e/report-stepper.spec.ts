import { expect, test } from "@playwright/test";

import { loginUser } from "./helpers/auth";

const TEST_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);

async function mockLocation(
  page: import("@playwright/test").Page,
  latitude: number,
  longitude: number,
) {
  await page.addInitScript(
    ({ lat, lng }) => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: (position: unknown) => void) {
            success({
              coords: { latitude: lat, longitude: lng, accuracy: 12 },
              timestamp: Date.now(),
            });
          },
        },
      });
    },
    { lat: latitude, lng: longitude },
  );

  await page.route("**/api/location/reverse-geocode?*", async (route) => {
    await route.fulfill({
      status: 200,
      json: { ok: true, address: "Jalan Contoh, Kecamatan Pati, Kabupaten Pati" },
    });
  });
}

async function attachPhoto(page: import("@playwright/test").Page) {
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "test-photo.png",
    mimeType: "image/png",
    buffer: TEST_PNG,
  });
  await expect(page.getByAltText("Foto 1")).toBeVisible();
}

async function fillDetails(page: import("@playwright/test").Page) {
  await page
    .getByPlaceholder(/Jalan Raya Pati-Tayu/i)
    .fill("Jalan Raya Pati-Tayu KM 12, Kecamatan Gabus, depan Pasar Desa Tanjang");
  await page
    .getByPlaceholder(/Lampu penerangan jalan mati/i)
    .fill("Lampu penerangan jalan mati di ruas Tanjang - Gabus");
  await page.locator("select").selectOption("lampu");
  await page
    .getByPlaceholder(/Jelaskan kondisi kerusakan secara detail/i)
    .fill("Lampu penerangan jalan mati sejak seminggu terakhir sehingga jalan sangat gelap pada malam hari.");
}

test.describe("report form stepper", () => {
  test("walks from photo to review, keeps data, and supports browser back", async ({ page }) => {
    await mockLocation(page, -6.7558, 111.0379);
    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      await route.fulfill({ status: 503, json: { ok: false, message: "Analisis AI gagal." } });
    });

    await page.goto("/report/new");
    await expect(page.getByRole("heading", { name: "Foto Kerusakan" })).toBeVisible();

    await attachPhoto(page);
    await page.getByRole("button", { name: "Lanjut ke Detail" }).click();
    await expect(page.getByRole("heading", { name: "Lokasi & Detail Laporan" })).toBeVisible();

    await fillDetails(page);
    await page.getByRole("button", { name: "Lanjut ke Tinjauan" }).click();
    await expect(page.getByRole("heading", { name: "Tinjau & Kirim" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Detail Laporan" })).toBeVisible();
    await expect(page.getByText("Lampu penerangan jalan mati di ruas Tanjang - Gabus")).toBeVisible();

    const submit = page.getByRole("button", { name: "Kirim Laporan" });
    await expect(submit).toBeDisabled();
    await page.getByRole("checkbox").check();
    await expect(submit).toBeEnabled();

    await page.goBack();
    await expect(page.getByRole("heading", { name: "Lokasi & Detail Laporan" })).toBeVisible();
    await expect(page.getByPlaceholder(/Lampu penerangan jalan mati/i)).toHaveValue(
      "Lampu penerangan jalan mati di ruas Tanjang - Gabus",
    );
  });

  test("blocks the next step when the device is outside Kabupaten Pati", async ({ page }) => {
    await mockLocation(page, -6.9932, 110.4229);
    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      await route.fulfill({ status: 503, json: { ok: false, message: "Analisis AI gagal." } });
    });

    await page.goto("/report/new");
    test.skip(
      await page.getByText("Mode simulasi lokasi aktif").isVisible(),
      "NEXT_PUBLIC_ENABLE_MOCK_LOCATION=true overrides browser geolocation. Run with false to test outside-Pati blocking.",
    );
    await attachPhoto(page);
    await page.getByRole("button", { name: "Lanjut ke Detail" }).click();
    await fillDetails(page);

    await expect(page.getByText(/di luar wilayah Kabupaten Pati/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Lanjut ke Tinjauan" })).toBeDisabled();
  });

  test("authenticated citizens can open the stepper", async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    test.skip(!email || !password, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run.");

    await loginUser(page, email!, password!);
    await page.goto("/report/new");
    await expect(page.getByRole("heading", { name: "Foto Kerusakan" })).toBeVisible();
  });
});

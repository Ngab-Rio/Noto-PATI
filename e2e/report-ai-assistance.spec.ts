import { expect, test } from "@playwright/test";

const TEST_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);

async function attachTestPhoto(page: import("@playwright/test").Page) {
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "test-photo.png",
    mimeType: "image/png",
    buffer: TEST_PNG,
  });
  await expect(page.getByAltText("Foto 1")).toBeVisible();
}

test.describe("AI assistance in report form", () => {
  test("runs on demand and autofills empty fields without replacing a manual edit", async ({ page }) => {
    let analysisRequests = 0;
    let releaseAnalysis!: () => void;
    let resolveRequestStarted!: () => void;
    const analysisResponse = new Promise<void>((resolve) => {
      releaseAnalysis = resolve;
    });
    const requestStarted = new Promise<void>((resolve) => {
      resolveRequestStarted = resolve;
    });

    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      analysisRequests += 1;
      resolveRequestStarted();
      await analysisResponse;
      await route.fulfill({
        status: 200,
        json: {
          ok: true,
          analysisId: "e6f4a8f3-6dd8-4e16-9eef-b66c28d8c78f",
          provider: "openai-compatible",
          model: "test-vision-model",
          analysis: {
            category: "jalan",
            title: "Permukaan jalan berlubang di ruas desa",
            description: "Terlihat lubang pada permukaan jalan dalam foto.",
            confidence: 0.72,
          },
        },
      });
    });

    await page.goto("/report/new");
    await attachTestPhoto(page);
    const analyzeButton = page.getByRole("button", { name: "Analisis dengan AI" });
    await expect(analyzeButton).toBeVisible();
    expect(analysisRequests).toBe(0);
    await analyzeButton.click();
    await requestStarted;

    const title = page.getByPlaceholder(/Lampu penerangan jalan mati/i);
    await title.fill("Judul yang sudah ditulis pengguna");
    releaseAnalysis();

    const category = page.locator("select").filter({ has: page.locator('option[value="jalan"]') });
    const description = page.getByPlaceholder(/Jelaskan kondisi kerusakan secara detail/i);
    await expect(page.getByText("Confidence 72%", { exact: false })).toBeVisible();
    await expect(page.getByText("Field kosong telah diisi dengan saran AI.", { exact: false })).toBeVisible();
    await expect(title).toHaveValue("Judul yang sudah ditulis pengguna");
    await expect(category).toHaveValue("jalan");
    await expect(description).toHaveValue("Terlihat lubang pada permukaan jalan dalam foto.");
    await description.fill("Deskripsi yang sudah diedit oleh pengguna.");
    await expect(description).toHaveValue("Deskripsi yang sudah diedit oleh pengguna.");
    await expect(page.getByRole("button", { name: "Analisis dengan AI" })).toBeVisible();
    expect(analysisRequests).toBe(1);
  });

  test("keeps manual entry available when on-demand analysis fails", async ({ page }) => {
    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      await route.fulfill({
        status: 503,
        json: {
          ok: false,
          message: "Analisis AI gagal. Silakan coba lagi atau lanjutkan secara manual.",
        },
      });
    });

    await page.goto("/report/new");
    await attachTestPhoto(page);
    await page.getByRole("button", { name: "Analisis dengan AI" }).click();

    await expect(page.getByText(/Analisis AI gagal.*lanjutkan secara manual/i)).toBeVisible();
    const title = page.getByPlaceholder(/Lampu penerangan jalan mati/i);
    await title.fill("Judul manual tetap dapat digunakan");
    await expect(title).toHaveValue("Judul manual tetap dapat digunakan");
  });

  test("fills location from reverse geocoding without overwriting a manual edit", async ({ page }) => {
    let releaseGeocode!: () => void;
    let resolveGeocodeStarted!: () => void;
    const geocodeResponse = new Promise<void>((resolve) => {
      releaseGeocode = resolve;
    });
    const geocodeStarted = new Promise<void>((resolve) => {
      resolveGeocodeStarted = resolve;
    });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
      });
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: (position: unknown) => void) {
            success({
              coords: { latitude: -6.75, longitude: 111.05, accuracy: 10 },
              timestamp: Date.now(),
            });
          },
        },
      });
    });
    await page.route("**/api/location/reverse-geocode?*", async (route) => {
      resolveGeocodeStarted();
      await geocodeResponse;
      await route.fulfill({
        status: 200,
        json: { ok: true, address: "Jalan Contoh, Kecamatan Pati, Kabupaten Pati" },
      });
    });
    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      await route.fulfill({ status: 503, json: { ok: false, message: "Analisis AI gagal." } });
    });

    await page.goto("/report/new");
    const fileChooser = page.waitForEvent("filechooser");
    await page.getByText("Ambil foto dengan kamera").click();
    await (await fileChooser).setFiles({
      name: "test-photo.png",
      mimeType: "image/png",
      buffer: TEST_PNG,
    });
    await geocodeStarted;

    const location = page.getByPlaceholder(/Jalan Raya Pati-Tayu/i);
    await location.fill("Lokasi yang sudah dikoreksi pengguna");
    releaseGeocode();

    await expect(page.getByText(/melalui OpenStreetMap/)).toBeVisible();
    await expect(location).toHaveValue("Lokasi yang sudah dikoreksi pengguna");
  });

  test("autofills the location field from the device coordinates", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) },
      });
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(success: (position: unknown) => void) {
            success({
              coords: { latitude: -6.75, longitude: 111.05, accuracy: 10 },
              timestamp: Date.now(),
            });
          },
        },
      });
    });
    await page.route("**/api/location/reverse-geocode?*", async (route) => {
      await route.fulfill({
        status: 200,
        json: { ok: true, address: "Jalan Contoh, Kecamatan Pati, Kabupaten Pati" },
      });
    });
    await page.route("**/api/ai/analyze-report-photo", async (route) => {
      await route.fulfill({ status: 503, json: { ok: false, message: "Analisis AI gagal." } });
    });

    await page.goto("/report/new");
    const fileChooser = page.waitForEvent("filechooser");
    await page.getByText("Ambil foto dengan kamera").click();
    await (await fileChooser).setFiles({
      name: "test-photo.png",
      mimeType: "image/png",
      buffer: TEST_PNG,
    });

    const location = page.getByPlaceholder(/Jalan Raya Pati-Tayu/i);
    await expect(location).toHaveValue("Jalan Contoh, Kecamatan Pati, Kabupaten Pati");
    await expect(page.getByText(/melalui OpenStreetMap/)).toBeVisible();
    await location.fill("Alamat yang diperbaiki pengguna");
    await expect(location).toHaveValue("Alamat yang diperbaiki pengguna");
  });

  test("keeps the selected photo and allows a location retry when GPS permission is denied", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(
            _success: (position: unknown) => void,
            failure: (error: { code: number }) => void,
          ) {
            failure({ code: 1 });
          },
        },
      });
    });

    await page.goto("/report/new");
    await attachTestPhoto(page);

    await expect(page.getByAltText("Foto 1")).toBeVisible();
    await expect(page.getByText(/Izin lokasi ditolak/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Coba deteksi lokasi lagi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Analisis dengan AI" })).toBeVisible();
  });
});

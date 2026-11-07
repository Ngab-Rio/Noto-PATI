import { expect, test } from "@playwright/test";

const MAP_FIXTURE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [111.0379, -6.7558] },
      properties: {
        id: "report-1",
        ticketNumber: "NP-001",
        title: "Jalan berlubang",
        category: "jalan",
        status: "diproses",
        detailLocation: "Pati",
        createdAt: "2026-01-01T00:00:00Z",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [111.0395, -6.7565] },
      properties: {
        id: "report-2",
        ticketNumber: "NP-002",
        title: "Lampu mati",
        category: "lampu",
        status: "diterima",
        detailLocation: "Pati",
        createdAt: "2026-01-01T00:00:00Z",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [111.036, -6.7545] },
      properties: {
        id: "report-3",
        ticketNumber: "NP-003",
        title: "Drainase tersumbat",
        category: "drainase",
        status: "diverifikasi",
        detailLocation: "Pati",
        createdAt: "2026-01-01T00:00:00Z",
      },
    },
  ],
};

test.describe("public map density modes", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "MapLibre WebGL behavior is covered in Chromium"
  );

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/reports/map**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MAP_FIXTURE),
      })
    );
    await page.goto("/#peta-laporan");
    await expect(
      page.getByRole("group", { name: "Pilihan mode tampilan peta" })
    ).toBeVisible({ timeout: 30_000 });
  });

  test("switches between heatmap and cluster without resetting status filters", async ({
    page,
  }) => {
    const heatmap = page.getByRole("button", { name: "Heatmap", exact: true });
    const cluster = page.getByRole("button", { name: "Klaster", exact: true });
    const diproses = page.getByRole("button", { name: "Diproses", exact: true });

    await expect(heatmap).toHaveAttribute("aria-pressed", "true");

    await diproses.click();
    await expect(diproses).toHaveAttribute("aria-pressed", "true");

    await cluster.click();
    await expect(cluster).toHaveAttribute("aria-pressed", "true");
    await expect(heatmap).toHaveAttribute("aria-pressed", "false");
    await expect(diproses).toHaveAttribute("aria-pressed", "true");
  });

  test("legend explains the active mode", async ({ page }) => {
    await page.getByRole("button", { name: "Legenda Peta" }).click();
    await expect(page.getByText("Kepadatan Laporan")).toBeVisible();
    await expect(page.getByText("Rendah")).toBeVisible();

    await page.getByRole("button", { name: "Klaster", exact: true }).click();
    await expect(page.getByText("Kepadatan Klaster")).toBeVisible();
    await expect(page.getByText("2-5 laporan")).toBeVisible();
    await expect(page.getByText("21+ laporan")).toBeVisible();
  });
});

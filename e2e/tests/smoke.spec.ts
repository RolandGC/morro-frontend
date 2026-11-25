import { expect, test } from "@playwright/test";
import { dismissCashSessionDialog } from "../helpers/ui";

const hasCredentials = Boolean(
  process.env.E2E_EMAIL && process.env.E2E_PASSWORD,
);

test.describe("Smoke E2E", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials,
      "Configura E2E_EMAIL y E2E_PASSWORD para ejecutar los E2E.",
    );
  });

  test("el dashboard carga sin errores de runtime", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/dashboard");
    await dismissCashSessionDialog(page);

    await expect(
      page.getByRole("heading", { name: "Panel general", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("This page couldn't load")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("las secciones principales cargan correctamente", async ({ page }) => {
    const sections = [
      { path: "/sales/sale", heading: "Ventas" },
      { path: "/finance/cashbox", heading: "Caja" },
      { path: "/finance/daily-closings", heading: "Cierre diario" },
      { path: "/core/series", heading: "Series" },
      { path: "/billing/settings", heading: "Configuración de facturación" },
    ];

    for (const section of sections) {
      await page.goto(section.path);
      await dismissCashSessionDialog(page);
      await expect(
        page.getByRole("heading", { name: section.heading, exact: true }),
      ).toBeVisible();
      await expect(page.getByText("This page couldn't load")).toHaveCount(0);
    }
  });
});

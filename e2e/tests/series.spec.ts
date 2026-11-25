import { expect, test } from "@playwright/test";
import { dismissCashSessionDialog } from "../helpers/ui";

const hasCredentials = Boolean(
  process.env.E2E_EMAIL && process.env.E2E_PASSWORD,
);

test.describe("Series E2E", () => {
  test.beforeEach(() => {
    test.skip(!hasCredentials, "Configura E2E_EMAIL y E2E_PASSWORD.");
  });

  test("muestra filtros de ambiente y régimen", async ({ page }) => {
    await page.goto("/core/series");
    await dismissCashSessionDialog(page);

    await expect(
      page.getByRole("heading", { name: "Series", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Ambiente")).toBeVisible();
    await expect(page.getByLabel("Régimen")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear Serie" }),
    ).toBeVisible();
  });
});

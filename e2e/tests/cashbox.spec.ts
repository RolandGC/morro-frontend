import { expect, test } from "@playwright/test";
import { dismissCashSessionDialog } from "../helpers/ui";

const hasCredentials = Boolean(
  process.env.E2E_EMAIL && process.env.E2E_PASSWORD,
);

test.describe("Caja E2E", () => {
  test.beforeEach(() => {
    test.skip(!hasCredentials, "Configura E2E_EMAIL y E2E_PASSWORD.");
  });

  test("muestra el historial y las acciones de caja", async ({ page }) => {
    await page.goto("/finance/cashbox");
    await dismissCashSessionDialog(page);

    await expect(
      page.getByRole("heading", { name: "Caja", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir caja" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Cerrar caja" }),
    ).toBeVisible();
  });

  test("abre y cierra una caja", async ({ page }) => {
    test.skip(
      process.env.E2E_MUTATIONS !== "1",
      "Activa E2E_MUTATIONS=1 para ejecutar el flujo que abre y cierra caja.",
    );

    await page.goto("/finance/cashbox");
    await dismissCashSessionDialog(page);

    const openButton = page.getByRole("button", { name: "Abrir caja" });
    const closeButton = page.getByRole("button", { name: "Cerrar caja" });

    if (await closeButton.isEnabled()) {
      test.skip(true, "Ya existe una caja abierta para este usuario.");
    }

    await openButton.click();

    const openDialog = page.getByRole("dialog").filter({
      hasText: "Apertura de caja",
    });
    await expect(openDialog).toBeVisible();

    const confirmOpen = openDialog.getByRole("button", {
      name: "Confirmar apertura",
    });
    if (!(await confirmOpen.isVisible().catch(() => false))) {
      test.skip(
        true,
        "No hay cuentas de efectivo disponibles para abrir la caja.",
      );
    }

    await confirmOpen.click();
    await expect(closeButton).toBeEnabled({ timeout: 20_000 });

    await closeButton.click();
    const closeDialog = page.getByRole("dialog").filter({
      hasText: "Cierre de caja",
    });
    await expect(closeDialog).toBeVisible();

    await closeDialog.getByRole("button", { name: "Confirmar cierre" }).click();
    await expect(
      page.getByText("Sesión de caja cerrada correctamente"),
    ).toBeVisible({ timeout: 20_000 });
  });
});

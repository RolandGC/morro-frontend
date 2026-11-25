import { expect, test } from "@playwright/test";
import { dismissCashSessionDialog } from "../helpers/ui";

const hasCredentials = Boolean(
  process.env.E2E_EMAIL && process.env.E2E_PASSWORD,
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("Ventas E2E", () => {
  test.beforeEach(() => {
    test.skip(!hasCredentials, "Configura E2E_EMAIL y E2E_PASSWORD.");
  });

  test("muestra el listado y acceso a nueva venta", async ({ page }) => {
    await page.goto("/sales/sale");
    await dismissCashSessionDialog(page);

    await expect(
      page.getByRole("heading", { name: "Ventas", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nueva Venta" }),
    ).toBeVisible();
  });

  test("registra una venta y emite una boleta local", async ({ page }) => {
    const product = process.env.E2E_PRODUCT_NAME;
    const customerDoc = process.env.E2E_CUSTOMER_DOC;
    const paymentAccount = process.env.E2E_PAYMENT_ACCOUNT_NAME;
    const amount = process.env.E2E_SALE_AMOUNT ?? "1";

    test.skip(
      process.env.E2E_SALES_FLOW !== "1" ||
        !product ||
        !customerDoc ||
        !paymentAccount,
      "Activa E2E_SALES_FLOW=1 y configura E2E_PRODUCT_NAME, E2E_CUSTOMER_DOC y E2E_PAYMENT_ACCOUNT_NAME.",
    );

    const productName = product!;
    const customerDocument = customerDoc!;
    const accountName = paymentAccount!;

    await page.goto("/sales/sale/add");
    await dismissCashSessionDialog(page);
    await expect(
      page.getByRole("heading", { name: "Nueva venta", exact: true }),
    ).toBeVisible();

    await page.locator("#sale-product-search").fill(productName);
    const productButton = page
      .getByRole("button", {
        name: new RegExp(`^Agregar ${escapeRegExp(productName)}`),
      })
      .first();
    await expect(productButton).toBeVisible();
    await productButton.click();

    await page
      .getByPlaceholder("Buscar por documento o nombre...")
      .fill(customerDocument);
    const customerButton = page
      .getByRole("button")
      .filter({ hasText: customerDocument })
      .first();
    await expect(customerButton).toBeVisible();
    await customerButton.click();

    await page.goto("/sales/sale/add/payments");
    await dismissCashSessionDialog(page);
    await expect(
      page.getByRole("heading", { name: "Registrar pago", exact: true }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /Agregar (primer )?pago/ })
      .first()
      .click();

    await page.getByLabel("Forma de pago").click();
    await page.getByRole("option", { name: accountName }).click();

    await page.getByLabel("Monto").fill(amount);
    await page.getByRole("button", { name: "Guardar venta" }).click();

    await expect(page.getByText("Venta creada correctamente")).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole("button", { name: "Emitir boleta" }).click();
    const ticketDialog = page.getByRole("dialog").filter({
      hasText: "Emitir boleta",
    });
    await expect(ticketDialog).toBeVisible();

    await ticketDialog.getByText("Seleccionar todos").click();
    await ticketDialog
      .getByRole("button", { name: "Emitir boleta" })
      .click();

    await expect(
      page.getByText("Boleta emitida correctamente"),
    ).toBeVisible({ timeout: 30_000 });
  });
});

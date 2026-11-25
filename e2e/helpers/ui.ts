import type { Page } from "@playwright/test";

/**
 * La app abre el modal de apertura de caja en el layout protegido cuando el
 * usuario no tiene una sesión abierta. En E2E puede tapar la pantalla antes
 * de que exista una caja, así que se cierra para poder validar la ruta.
 */
export async function dismissCashSessionDialog(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog").filter({
    hasText: "Apertura de caja",
  });

  await dialog
    .waitFor({ state: "visible", timeout: 5_000 })
    .catch(() => undefined);

  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: "Cancelar" }).click();
  }
}

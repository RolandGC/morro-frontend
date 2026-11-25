import "./load-env";
import fs from "node:fs/promises";
import path from "node:path";
import { request } from "@playwright/test";

const baseURL = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const apiURL = (process.env.E2E_API_URL ?? "http://localhost:4000/api").replace(
  /\/+$/,
  "",
);

type E2ECompany = {
  id: string;
  name?: string | null;
  trade_name?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
};
const authFile =
  process.env.E2E_AUTH_FILE ??
  path.join(__dirname, ".auth", "state.json");

async function writeEmptyState() {
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify({ cookies: [], origins: [] }, null, 2),
  );
}

export default async function globalSetup() {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[e2e] E2E_EMAIL/E2E_PASSWORD no configurados. Los tests de navegador se omitirán.",
    );
    await writeEmptyState();
    return;
  }

  const api = await request.newContext({
    extraHTTPHeaders: { Accept: "application/json" },
  });

  try {
    const appCheck = await api
      .get(`${baseURL}/sales/sale`)
      .catch(() => null);

    if (!appCheck) {
      throw new Error(
        `No se pudo conectar a E2E_BASE_URL (${baseURL}). ¿Está levantado el frontend?`,
      );
    }

    if (appCheck.status() === 404) {
      throw new Error(
        `E2E_BASE_URL (${baseURL}) no parece ser el frontend actual: /sales/sale respondió 404. Usa el puerto donde corre el frontend con los últimos cambios.`,
      );
    }

    const login = await api.post(`${apiURL}/auth/login`, {
      data: { email, password },
    });
    if (!login.ok()) {
      throw new Error(
        `Login E2E falló (${login.status()}): ${await login.text()}`,
      );
    }

    const loginData = (await login.json()) as { access_token?: string };
    const initialToken = loginData.access_token;
    if (!initialToken) throw new Error("Login E2E no devolvió access_token");

    const companiesResponse = await api.get(`${apiURL}/companies`, {
      headers: { Authorization: `Bearer ${initialToken}` },
    });
    if (!companiesResponse.ok()) {
      throw new Error(
        `No se pudieron listar empresas para E2E (${companiesResponse.status()})`,
      );
    }

    const companiesPayload = (await companiesResponse.json()) as
      | { data?: E2ECompany[] }
      | E2ECompany[];
    const companies: E2ECompany[] = Array.isArray(companiesPayload)
      ? companiesPayload
      : (companiesPayload.data ?? []);
    const requestedId = process.env.E2E_COMPANY_ID;
    const requestedName = process.env.E2E_COMPANY_NAME?.toLowerCase();

    const company = companies.find((item) => {
      if (requestedId) return item.id === requestedId;
      if (requestedName) {
        return (
          String(item.name ?? "").toLowerCase() === requestedName ||
          String(item.trade_name ?? "").toLowerCase() === requestedName
        );
      }
      return item.is_active !== false;
    });

    if (!company) {
      throw new Error(
        `No se encontró empresa para E2E. Disponibles: ${companies
          .map((item) => `${item.name} (${item.id})`)
          .join(", ")}`,
      );
    }

    const selected = await api.post(`${apiURL}/auth/select-company`, {
      data: { company_id: company.id },
      headers: { Authorization: `Bearer ${initialToken}` },
    });
    if (!selected.ok()) {
      throw new Error(
        `No se pudo seleccionar empresa para E2E (${selected.status()}): ${await selected.text()}`,
      );
    }

    const selectedData = (await selected.json()) as { access_token?: string };
    const token = selectedData.access_token;
    if (!token) throw new Error("select-company no devolvió access_token");

    const url = new URL(baseURL);
    const secure = url.protocol === "https:";
    const expires = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    await fs.mkdir(path.dirname(authFile), { recursive: true });
    await fs.writeFile(
      authFile,
      JSON.stringify(
        {
          cookies: [
            {
              name: "access_token",
              value: token,
              domain: url.hostname,
              path: "/",
              expires,
              httpOnly: false,
              secure,
              sameSite: "Strict",
            },
          ],
          origins: [
            {
              origin: baseURL,
              localStorage: [
                {
                  name: "selected_company",
                  value: JSON.stringify(company),
                },
              ],
            },
          ],
        },
        null,
        2,
      ),
    );

    console.log(`[e2e] Autenticado como ${email} en ${company.name}.`);
  } finally {
    await api.dispose();
  }
}

/**
 * Utilidades de formato compartidas por todo el POS.
 * Centralizar el formato evita que cada módulo use "PEN", "S/" o
 * valores sin decimales según quién lo escribió.
 */

export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = "PEN"
): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency,
    }).format(0);
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-PE", options).format(
    Number.isFinite(amount) ? amount : 0
  );
}

export function getInitials(value?: string | null): string {
  if (!value) return "?";

  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  return (parts[0][0] + (parts.length > 1 ? parts[1][0] : ""))
    .toUpperCase()
    .slice(0, 2);
}

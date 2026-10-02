const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-PE");

export function formatMoney(value: number | null | undefined): string {
  return moneyFormatter.format(Number(value ?? 0));
}

export function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(Number(value ?? 0));
}

/** Convierte `YYYY-MM-DD` a `DD/MM/YYYY`. */
export function formatDateLabel(value: string): string {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

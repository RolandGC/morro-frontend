export interface DateRange {
  from: string;
  to: string;
}

/** Convierte un Date a `YYYY-MM-DD` (formato que espera el backend). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function startOfMonth(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

/** Rango por defecto: primer día del mes actual hasta hoy. */
export function currentMonthRange(): DateRange {
  return { from: startOfMonth(), to: today() };
}

export function todayRange(): DateRange {
  const value = today();
  return { from: value, to: value };
}

export function last7DaysRange(): DateRange {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 6);
  return { from: toISODate(from), to: today() };
}

export function last30DaysRange(): DateRange {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 29);
  return { from: toISODate(from), to: today() };
}

export function previousMonthRange(): DateRange {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: toISODate(from), to: toISODate(to) };
}

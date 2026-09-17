const MONEY = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const PERCENT = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const MISSING = "—";

export function isPresent(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (!isPresent(value)) return MISSING;
  return MONEY.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (!isPresent(value)) return MISSING;
  return NUMBER.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (!isPresent(value)) return MISSING;
  return `${PERCENT.format(value)}%`;
}

export function formatRate(value: number | null | undefined): string {
  if (!isPresent(value)) return MISSING;
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

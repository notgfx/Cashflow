export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function requireSum(value: unknown): number {
  const n = parseNumber(value);
  if (n === null) {
    throw new Error("Нет обязательного поля: сумма");
  }
  if (n <= 0) {
    throw new Error("Сумма должна быть больше нуля");
  }
  return n;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseVars(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null || raw === "") return {};
  if (typeof raw === "string") {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      throw new Error("Блок дополнительных данных должен быть объектом");
    }
    return parsed;
  }
  if (isRecord(raw)) return raw;
  throw new Error("Блок дополнительных данных имеет неверный формат");
}

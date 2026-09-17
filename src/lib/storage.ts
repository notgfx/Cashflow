const KEY = "cashflow.session.v1";
const MAX_JSON_CHARS = 200_000;

export type StoredSession = {
  jsonText: string | null;
  cleared: boolean;
};

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    return {
      jsonText: typeof record.jsonText === "string" ? record.jsonText : null,
      cleared: Boolean(record.cleared),
    };
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  try {
    const jsonText =
      session.jsonText && session.jsonText.length > MAX_JSON_CHARS
        ? session.jsonText.slice(0, MAX_JSON_CHARS)
        : session.jsonText;
    localStorage.setItem(KEY, JSON.stringify({ ...session, jsonText }));
  } catch {
    // ignore quota / private mode
  }
}

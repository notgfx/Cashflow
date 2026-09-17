import examplePayment from "@/data/example-payment.json";
import {
  calculatePayment,
  FX_PAYMENT_SYSTEMS,
  moneyRound,
  observedMargin,
  snapSharePct,
} from "@/lib/calculations";
import {
  asPaymentSystem,
  isRecord,
  parseNumber,
  parseVars,
  requireSum,
} from "@/lib/validators";
import type {
  ExchangeRateInfo,
  FieldMismatch,
  InputResult,
  ManualInputs,
  ObservedPayment,
  PaymentAnalysis,
  PaymentSnapshot,
  PaymentSource,
  PayerRole,
} from "@/types/payment";

function parseJsonText(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Неизвестная ошибка разбора";
    throw Object.assign(new Error(detail), { parseFailed: true });
  }
}

function nestedRecord(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = parent[key];
  return isRecord(value) ? value : {};
}

function inferPayer(params: {
  ik?: string | null;
  sum: number;
  toPay: number | null;
  toCash: number | null;
  styling: number;
  commission: number;
  coupon: number;
  paymentSystem: string;
}): PayerRole {
  const ik = (params.ik || "").trim();
  if (ik === "invoice") return "sender";
  if (ik === "payway") return "recipient";
  if (FX_PAYMENT_SYSTEMS.has(params.paymentSystem)) {
    const toCash = params.toCash ?? 0;
    if (Math.abs(toCash - (params.sum - params.commission)) < 0.51) return "recipient";
    if (Math.abs(toCash - (params.sum + params.coupon)) < 0.51) return "sender";
    if (Math.abs(toCash - params.sum) < 0.51) return "sender";
    return "recipient";
  }
  if (params.toPay !== null && params.toPay - params.sum - params.styling > 0.5) {
    return "sender";
  }
  return "recipient";
}

function inferExchangeRate(params: {
  paymentSystem: string;
  currency?: string;
  sum: number;
  toPay: number | null;
  hiddenAmount: number | null;
}): ExchangeRateInfo | null {
  if (!FX_PAYMENT_SYSTEMS.has(params.paymentSystem)) return null;
  const foreign = params.hiddenAmount ?? params.toPay;
  if (foreign === null || foreign <= 0 || params.sum <= 0) return null;
  const rubLooksSameCurrency =
    params.currency === "RUB" &&
    params.toPay !== null &&
    Math.abs(params.toPay - params.sum) < 0.51 &&
    params.hiddenAmount === null;
  if (rubLooksSameCurrency) return null;

  const unitLabel =
    params.paymentSystem === "fcardusd"
      ? "USD"
      : params.paymentSystem === "fusdt"
        ? "USDT"
        : "исходная валюта";

  return {
    rate: params.sum / foreign,
    foreignAmount: foreign,
    rubAmount: params.sum,
    unitLabel,
  };
}

function defaultManual(): ManualInputs {
  return {
    sum: 0,
    stylingMode: "off",
    stylingCustom: 0,
    paymentSystem: "fsbp",
    payer: "recipient",
    tariff: 7,
    couponPct: 10,
    bonusPct: 10,
  };
}

function inferManual(observed: ObservedPayment): { inputs: ManualInputs; tariffFromJson: boolean } {
  const ps = observed.paymentSystem || "";
  const styling = observed.styling ?? 0;
  const coupon = observed.coupon ?? 0;
  const referral = observed.referral ?? 0;
  const commission = observed.commission ?? 0;
  const toPay = observed.toPay ?? observed.sum;
  const payer = observed.payerHint ?? "recipient";
  const usd = ps === "fcardusd";

  let tariffFromJson = false;
  let tariff = 7;
  let couponPct = 0;
  let bonusPct = 0;

  if (observed.commission !== null && observed.commission !== undefined && observed.sum > 0) {
    const margin = observedMargin({
      commission,
      coupon,
      styling,
      toPay,
      paymentSystem: ps,
    });
    couponPct = snapSharePct(margin > 0.05 ? (100 * coupon) / margin : 0);
    bonusPct = snapSharePct(margin > 0.05 ? (100 * referral) / margin : 0);
    const chargePct = (100 * (commission + coupon)) / observed.sum;
    const cpForPlus = usd ? 0 : couponPct;
    const bpForPlus = usd ? 0 : bonusPct;
    const plus1 = payer === "sender" && cpForPlus <= 0 && bpForPlus <= 0;
    tariff = moneyRound(chargePct - (usd ? 10 : 0) - (plus1 ? 1 : 0));
    tariffFromJson = true;
  }

  const auto = observed.sum > 0 ? Math.min(Math.max(observed.sum * 0.1, 10), 5000) : 0;
  let stylingMode: ManualInputs["stylingMode"] = "off";
  if (styling > 0 && Math.abs(styling - auto) < 0.02) stylingMode = "auto";
  else if (styling > 0) stylingMode = "custom";

  return {
    tariffFromJson,
    inputs: {
      sum: observed.sum,
      stylingMode,
      stylingCustom: styling,
      paymentSystem: asPaymentSystem(ps) || "",
      payer,
      tariff,
      couponPct: usd ? 0 : couponPct,
      bonusPct: usd ? 0 : bonusPct,
    },
  };
}

function normalizePayment(data: unknown, rawText: string): PaymentSnapshot {
  if (!isRecord(data)) {
    throw new Error("Ожидался объект платежа");
  }

  const sum = requireSum(data.sum);
  let vars: Record<string, unknown> = {};
  try {
    vars = parseVars(data.vars);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Не удалось разобрать дополнительные данные";
    throw new Error(detail);
  }

  const premium = nestedRecord(vars, "premium");
  const hidden = isRecord(data.hidden) ? data.hidden : {};
  const paymentSystem =
    (typeof vars.payment_system === "string" && vars.payment_system) ||
    (typeof data.payment_system === "string" && data.payment_system) ||
    null;
  const ik = typeof vars.ik_am_t === "string" ? vars.ik_am_t : null;
  const styling = parseNumber(premium.styling_cost) ?? 0;
  const coupon = parseNumber(vars.coupon_discount) ?? 0;
  const referral = parseNumber(vars.bonus_to_referrer) ?? 0;
  const commission = parseNumber(data.commission);
  const toPay = parseNumber(data.to_pay);
  const toCash = parseNumber(data.to_cash);
  const profit = parseNumber(data.profit);

  const payer = inferPayer({
    ik,
    sum,
    toPay,
    toCash,
    styling,
    commission: commission ?? 0,
    coupon,
    paymentSystem: paymentSystem || "",
  });

  const observed: ObservedPayment = {
    id: parseNumber(data.id) ?? undefined,
    status: typeof data.status === "string" ? data.status : undefined,
    currency: typeof data.currency === "string" ? data.currency : undefined,
    createdAt: typeof data.created_at === "string" ? data.created_at : undefined,
    sum,
    toPay,
    toCash,
    commission,
    profit,
    coupon,
    referral,
    styling,
    paymentSystem,
    payerHint: payer,
    hiddenAmount: parseNumber(hidden.AMOUNT),
    hiddenCurrencyId: hidden.CUR_ID as string | number | null | undefined ?? null,
  };

  const inferred = inferManual(observed);
  const exchangeRate = inferExchangeRate({
    paymentSystem: paymentSystem || "",
    currency: observed.currency,
    sum,
    toPay,
    hiddenAmount: observed.hiddenAmount ?? null,
  });

  return {
    observed,
    inferred: inferred.inputs,
    tariffFromJson: inferred.tariffFromJson,
    exchangeRate,
    raw: data,
    rawText,
  };
}

function toMismatch(
  label: string,
  calculated: number,
  observed: number | null | undefined,
): FieldMismatch | null {
  if (observed === null || observed === undefined) return null;
  if (Math.abs(calculated - observed) <= 0.05) return null;
  return { label, calculated, observed };
}

function mismatches(analysisInputs: {
  snapshot: PaymentSnapshot;
  calculation: ReturnType<typeof calculatePayment>;
}): FieldMismatch[] {
  const { snapshot, calculation } = analysisInputs;
  const skipToPay = FX_PAYMENT_SYSTEMS.has(snapshot.observed.paymentSystem || "");
  const rows: Array<{ label: string; calculated: number; observed: number | null | undefined }> = [
    { label: "К оплате", calculated: calculation.toPay, observed: snapshot.observed.toPay },
    { label: "Комиссия сервиса", calculated: calculation.commission, observed: snapshot.observed.commission },
    { label: "Прибыль сервиса", calculated: calculation.profit, observed: snapshot.observed.profit },
    { label: "Получателю", calculated: calculation.toCash, observed: snapshot.observed.toCash },
    { label: "Скидка по купону", calculated: calculation.coupon, observed: snapshot.observed.coupon },
    { label: "Бонус пригласившему", calculated: calculation.referral, observed: snapshot.observed.referral },
  ];
  return rows
    .filter((row) => !(skipToPay && row.label === "К оплате"))
    .map((row) => toMismatch(row.label, row.calculated, row.observed))
    .filter((row): row is FieldMismatch => row !== null);
}

function pretty(value: unknown, fallback: string): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
}

export function ingestPayment(source: PaymentSource): InputResult<PaymentSnapshot> {
  try {
    if (source.kind === "hash" || source.kind === "message") {
      return {
        ok: false,
        error: {
          title: "Источник пока не подключен",
          detail: "Этот способ передачи данных зарезервирован для будущей интеграции.",
        },
      };
    }
    if (source.kind === "manual") {
      return {
        ok: false,
        error: {
          title: "Нет JSON",
          detail: "Ручной режим не создаёт снимок JSON. Сначала загрузите платёж или пример.",
        },
      };
    }

    const rawText =
      source.kind === "example" ? pretty(examplePayment, "") : source.raw.trim();
    if (!rawText) {
      return {
        ok: false,
        error: { title: "Пустые данные", detail: "Вставьте JSON платежа." },
      };
    }
    const parsed = parseJsonText(rawText);
    const snapshot = normalizePayment(parsed, pretty(parsed, rawText));
    return { ok: true, value: snapshot };
  } catch (error) {
    const parseFailed = Boolean(error && typeof error === "object" && "parseFailed" in error);
    const detail = error instanceof Error ? error.message : "Неизвестная ошибка";
    return {
      ok: false,
      error: {
        title: parseFailed ? "Не удалось разобрать JSON" : "Некорректные данные платежа",
        detail,
      },
    };
  }
}

export function analyzePayment(
  snapshot: PaymentSnapshot | null,
  inputs: ManualInputs,
): PaymentAnalysis {
  const currenciesDiffer = Boolean(snapshot?.exchangeRate);
  const calculation = calculatePayment(inputs, { currenciesDiffer });
  return {
    snapshot,
    calculation,
    mismatches: snapshot ? mismatches({ snapshot, calculation }) : [],
  };
}

export function exampleSnapshot(): PaymentSnapshot {
  const result = ingestPayment({ kind: "example" });
  if (!result.ok) {
    throw new Error(result.error.detail);
  }
  return result.value;
}

export function defaultDemoInputs(): ManualInputs {
  return exampleSnapshot().inferred;
}

export { defaultManual };

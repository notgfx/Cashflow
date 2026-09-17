export const PAYMENT_SYSTEMS = [
  "fsbp",
  "fcard",
  "fcardusd",
  "fusdt",
  "fethereum",
  "flitecoin",
  "fbitcoin",
  "ffreekassa",
  "dppaypal",
] as const;

export type PaymentSystem = (typeof PAYMENT_SYSTEMS)[number];

export type PayerRole = "sender" | "recipient";

export type StylingMode = "off" | "auto" | "custom";

export type ManualInputs = {
  sum: number;
  stylingMode: StylingMode;
  stylingCustom: number;
  paymentSystem: PaymentSystem | "";
  payer: PayerRole;
  tariff: number;
  couponPct: number;
  bonusPct: number;
};

export type ObservedPayment = {
  id?: number;
  status?: string;
  currency?: string;
  createdAt?: string;
  sum: number;
  toPay?: number | null;
  toCash?: number | null;
  commission?: number | null;
  profit?: number | null;
  coupon?: number | null;
  referral?: number | null;
  styling?: number | null;
  paymentSystem?: string | null;
  payerHint?: PayerRole | null;
  hiddenAmount?: number | null;
  hiddenCurrencyId?: string | number | null;
};

export type PaymentCalculation = {
  sum: number;
  styling: number;
  paymentSystem: string;
  payer: PayerRole;
  sender: boolean;
  tariff: number;
  chargePct: number;
  senderPlus1: boolean;
  intlPp: number;
  usdCard: boolean;
  couponPct: number;
  bonusPct: number;
  couponPctIn: number;
  bonusPctIn: number;
  serviceCharge: number;
  toPay: number;
  acquirerRate: number;
  acquirer: number;
  acquirerFromRubGross: boolean;
  gross: number;
  margin: number;
  coupon: number;
  referral: number;
  commission: number;
  profit: number;
  profitAfterReferral: number;
  toCash: number;
};

export type ExchangeRateInfo = {
  rate: number;
  foreignAmount: number;
  rubAmount: number;
  unitLabel: string;
};

export type FieldMismatch = {
  label: string;
  calculated: number;
  observed: number;
};

export type PaymentSnapshot = {
  observed: ObservedPayment;
  inferred: ManualInputs;
  tariffFromJson: boolean;
  exchangeRate: ExchangeRateInfo | null;
  raw: unknown;
  rawText: string;
};

export type PaymentAnalysis = {
  snapshot: PaymentSnapshot | null;
  calculation: PaymentCalculation;
  mismatches: FieldMismatch[];
};

export type PaymentSource =
  | { kind: "text"; raw: string }
  | { kind: "file"; name: string; raw: string }
  | { kind: "example" }
  | { kind: "manual"; values: ManualInputs }
  | { kind: "hash"; payload: string }
  | { kind: "message"; payload: unknown };

export type InputError = {
  title: string;
  detail: string;
};

export type InputResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: InputError };

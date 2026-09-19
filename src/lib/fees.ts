import feesJson from "@/data/fees.json";

export type FeesConfig = {
  acquirerRates: Record<string, number>;
  fxPaymentSystems: string[];
  fxUnitLabels: Record<string, string>;
  fxUnitLabelFallback: string;
  intlCardPaymentSystem: string;
  acquirerFromRubGrossWhenCurrenciesDiffer: string[];
  intlCardExtraPp: number;
  senderNoPromoPp: number;
  shareBuckets: number[];
  shareBucketTolerance: number;
  defaults: {
    paymentSystem: string;
    tariff: number;
    couponPct: number;
    bonusPct: number;
  };
  autoStyling: {
    rate: number;
    min: number;
    max: number;
  };
};

export const FEES = feesJson as FeesConfig;

export const ACQUIRER_RATES = FEES.acquirerRates;

export const FX_PAYMENT_SYSTEMS = new Set(FEES.fxPaymentSystems);

export const SHARE_BUCKETS = FEES.shareBuckets;

export function isFxPaymentSystem(code: string): boolean {
  return FX_PAYMENT_SYSTEMS.has(code);
}

export function isIntlCard(code: string): boolean {
  return code === FEES.intlCardPaymentSystem;
}

export function acquirerRate(code: string): number {
  return ACQUIRER_RATES[code] ?? 0;
}

export function acquirerFromRubGross(
  paymentSystem: string,
  currenciesDiffer: boolean,
): boolean {
  return (
    currenciesDiffer &&
    FEES.acquirerFromRubGrossWhenCurrenciesDiffer.includes(paymentSystem)
  );
}

export function fxUnitLabel(code: string): string {
  return FEES.fxUnitLabels[code] ?? FEES.fxUnitLabelFallback;
}

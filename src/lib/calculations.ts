import type { ManualInputs, PaymentCalculation, PayerRole } from "@/types/payment";
import {
  ACQUIRER_RATES,
  FEES,
  FX_PAYMENT_SYSTEMS,
  SHARE_BUCKETS,
  acquirerFromRubGross,
  acquirerRate,
  isIntlCard,
} from "@/lib/fees";

export { ACQUIRER_RATES, FX_PAYMENT_SYSTEMS, SHARE_BUCKETS };

export function moneyRound(value: number): number {
  return Math.round((value + 1e-12) * 100) / 100;
}

export function snapSharePct(raw: number, bucketTol = FEES.shareBucketTolerance): number {
  if (!Number.isFinite(raw) || raw <= 0.5) return 0;
  if (SHARE_BUCKETS.length === 0) return Math.round(raw * 10) / 10;
  const best = SHARE_BUCKETS.reduce((acc, bucket) =>
    Math.abs(bucket - raw) < Math.abs(acc - raw) ? bucket : acc,
  );
  if (Math.abs(best - raw) <= bucketTol) return best;
  return Math.round(raw * 10) / 10;
}

export function autoStyling(sum: number): number {
  if (sum <= 0) return 0;
  const { rate, min, max } = FEES.autoStyling;
  return Math.min(Math.max(sum * rate, min), max);
}

export function resolveStyling(inputs: ManualInputs): number {
  if (inputs.stylingMode === "off") return 0;
  if (inputs.stylingMode === "auto") return autoStyling(inputs.sum);
  return inputs.stylingCustom || 0;
}

export function calculateToPay(params: {
  sum: number;
  styling: number;
  serviceCharge: number;
  payer: PayerRole;
}): number {
  const { sum, styling, serviceCharge, payer } = params;
  return payer === "sender" ? sum + serviceCharge + styling : sum + styling;
}

export function calculateServiceCharge(sum: number, chargePct: number): number {
  return sum * (chargePct / 100);
}

export function calculateGross(serviceCharge: number, styling: number): number {
  return serviceCharge + styling;
}

export function calculateAcquirer(params: {
  toPay: number;
  paymentSystem: string;
  sum: number;
  serviceCharge: number;
  currenciesDiffer: boolean;
}): { amount: number; rate: number; fromRubGross: boolean } {
  const rate = acquirerRate(params.paymentSystem);
  if (acquirerFromRubGross(params.paymentSystem, params.currenciesDiffer)) {
    const rubGross = params.sum + params.serviceCharge;
    return { amount: rubGross * rate, rate, fromRubGross: true };
  }

  return { amount: params.toPay * rate, rate, fromRubGross: false };
}

export function calculateMargin(gross: number, acquirer: number): number {
  return gross - acquirer;
}

export function calculateCoupon(margin: number, couponPct: number): number {
  return margin * (couponPct / 100);
}

export function calculateReferral(margin: number, bonusPct: number): number {
  return margin * (bonusPct / 100);
}

export function calculateCommission(serviceCharge: number, coupon: number): number {
  return serviceCharge - coupon;
}

export function calculateProfit(margin: number, coupon: number): number {
  return margin - coupon;
}

export function calculateToCash(params: {
  sum: number;
  coupon: number;
  commission: number;
  payer: PayerRole;
}): number {
  return params.payer === "sender"
    ? params.sum + params.coupon
    : params.sum - params.commission;
}

export function calculatePayment(
  inputs: ManualInputs,
  options?: { currenciesDiffer?: boolean },
): PaymentCalculation {
  const sum = inputs.sum || 0;
  const styling = resolveStyling(inputs);
  const ps = inputs.paymentSystem || "";
  const usdCard = isIntlCard(ps);
  const couponPctIn = inputs.couponPct || 0;
  const bonusPctIn = inputs.bonusPct || 0;
  const couponPct = usdCard ? 0 : couponPctIn;
  const bonusPct = usdCard ? 0 : bonusPctIn;
  const sender = inputs.payer === "sender";
  const senderPlus1 = sender && couponPct <= 0 && bonusPct <= 0;
  const intlPp = usdCard ? FEES.intlCardExtraPp : 0;
  const chargePct =
    (inputs.tariff || 0) + intlPp + (senderPlus1 ? FEES.senderNoPromoPp : 0);
  const serviceCharge = calculateServiceCharge(sum, chargePct);
  const toPay = calculateToPay({
    sum,
    styling,
    serviceCharge,
    payer: inputs.payer,
  });
  const acquirerCalc = calculateAcquirer({
    toPay,
    paymentSystem: ps,
    sum,
    serviceCharge,
    currenciesDiffer: Boolean(options?.currenciesDiffer),
  });
  const gross = calculateGross(serviceCharge, styling);
  const margin = calculateMargin(gross, acquirerCalc.amount);
  const coupon = calculateCoupon(margin, couponPct);
  const referral = calculateReferral(margin, bonusPct);
  const commission = calculateCommission(serviceCharge, coupon);
  const profit = calculateProfit(margin, coupon);
  const toCash = calculateToCash({
    sum,
    coupon,
    commission,
    payer: inputs.payer,
  });

  return {
    sum,
    styling,
    paymentSystem: ps,
    payer: inputs.payer,
    sender,
    tariff: inputs.tariff || 0,
    chargePct,
    senderPlus1,
    intlPp,
    usdCard,
    couponPct,
    bonusPct,
    couponPctIn,
    bonusPctIn,
    serviceCharge,
    toPay,
    acquirerRate: acquirerCalc.rate,
    acquirer: acquirerCalc.amount,
    acquirerFromRubGross: acquirerCalc.fromRubGross,
    gross,
    margin,
    coupon,
    referral,
    commission,
    profit,
    profitAfterReferral: profit - referral,
    toCash,
  };
}

export function observedMargin(params: {
  commission: number;
  coupon: number;
  styling: number;
  toPay: number;
  paymentSystem: string;
}): number {
  const rate = acquirerRate(params.paymentSystem);
  if (FX_PAYMENT_SYSTEMS.has(params.paymentSystem)) {
    return params.commission + params.coupon + params.styling;
  }
  return params.commission + params.coupon + params.styling - params.toPay * rate;
}

import type { ManualInputs, PaymentCalculation } from "@/types/payment";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { paymentSystemLabel } from "@/lib/labels";

export function formulaToPay(calc: PaymentCalculation): string {
  if (calc.sender) {
    return `${formatCurrency(calc.sum)} + ${formatPercent(calc.chargePct)} × ${formatCurrency(calc.sum)} + ${formatCurrency(calc.styling)} = ${formatCurrency(calc.toPay)}`;
  }
  return `${formatCurrency(calc.sum)} + ${formatCurrency(calc.styling)} = ${formatCurrency(calc.toPay)}`;
}

export function formulaAcquirer(calc: PaymentCalculation): string {
  const base = calc.acquirerFromRubGross
    ? `${formatCurrency(calc.sum + calc.serviceCharge)}`
    : `${formatCurrency(calc.toPay)}`;
  const note = calc.acquirerFromRubGross ? " (рублёвая сумма + наценка сервиса)" : "";
  return `${formatPercent(calc.acquirerRate * 100)} × ${base}${note} = ${formatCurrency(calc.acquirer)}`;
}

export function formulaGross(calc: PaymentCalculation): string {
  return `${formatPercent(calc.chargePct)} × ${formatCurrency(calc.sum)} + ${formatCurrency(calc.styling)} = ${formatCurrency(calc.gross)}`;
}

export function formulaMargin(calc: PaymentCalculation): string {
  return `${formatCurrency(calc.gross)} − ${formatCurrency(calc.acquirer)} = ${formatCurrency(calc.margin)}`;
}

export function formulaCoupon(calc: PaymentCalculation): string {
  return `${formatPercent(calc.couponPct)} × ${formatCurrency(calc.margin)} = ${formatCurrency(calc.coupon)}`;
}

export function formulaReferral(calc: PaymentCalculation): string {
  return `${formatPercent(calc.bonusPct)} × ${formatCurrency(calc.margin)} = ${formatCurrency(calc.referral)}`;
}

export function formulaProfit(calc: PaymentCalculation): string {
  return `${formatCurrency(calc.margin)} − ${formatCurrency(calc.coupon)} = ${formatCurrency(calc.profit)}`;
}

export function formulaProfitAfterReferral(calc: PaymentCalculation): string {
  return `${formatCurrency(calc.profit)} − ${formatCurrency(calc.referral)} = ${formatCurrency(calc.profitAfterReferral)}`;
}

export function formulaToCash(calc: PaymentCalculation): string {
  if (calc.sender) {
    return `${formatCurrency(calc.sum)} + ${formatCurrency(calc.coupon)} = ${formatCurrency(calc.toCash)}`;
  }
  return `${formatCurrency(calc.sum)} − ${formatCurrency(calc.commission)} = ${formatCurrency(calc.toCash)}`;
}

export function formulaCharge(calc: PaymentCalculation): string {
  const extras: string[] = [];
  if (calc.intlPp) extras.push(`+ ${calc.intlPp} п.п. иностранная карта`);
  if (calc.senderPlus1) extras.push("+ 1 п.п. отправитель без купона и реферала");
  const extra = extras.length ? ` ${extras.join(" ")}` : "";
  return `${formatPercent(calc.tariff)}${extra} = ${formatPercent(calc.chargePct)}`;
}

export function formulaServiceCharge(calc: PaymentCalculation): string {
  return `${formatPercent(calc.chargePct)} × ${formatCurrency(calc.sum)} = ${formatCurrency(calc.serviceCharge)}`;
}

export function paymentMethodLine(calc: PaymentCalculation, inputs: ManualInputs): string {
  return paymentSystemLabel(inputs.paymentSystem || calc.paymentSystem);
}

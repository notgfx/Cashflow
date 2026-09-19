import { PAYMENT_SYSTEMS, type PaymentSystem, type PayerRole } from "@/types/payment";

export const PAYMENT_SYSTEM_LABELS: Record<PaymentSystem, string> = {
  fsbp: "СБП",
  fcard: "Карта РФ",
  fcardusd: "Иностранная карта",
  fusdt: "USDT",
  fethereum: "Ethereum",
  flitecoin: "Litecoin",
  fbitcoin: "Bitcoin",
  ffreekassa: "FreeKassa",
  dppaypal: "PayPal",
};

export function paymentSystemLabel(code: string | null | undefined): string {
  if (!code) return "—";
  if ((PAYMENT_SYSTEMS as readonly string[]).includes(code)) {
    return PAYMENT_SYSTEM_LABELS[code as PaymentSystem];
  }
  return code;
}

export function payerLabel(payer: PayerRole): string {
  return payer === "sender"
    ? "Комиссию платит отправитель"
    : "Комиссию платит получатель";
}

export const COMMISSION_BY_USER_LABEL = "Отправитель сам выбрал оплатить комиссию";

export const INVOICE_CBU_PROMO_HINT =
  "При invoice и commission_by_user бонусы и скидки за промо не применяются.";

export function stylingModeLabel(mode: "off" | "auto" | "custom"): string {
  if (mode === "auto") return "Авто";
  if (mode === "custom") return "Своя сумма";
  return "Нет";
}

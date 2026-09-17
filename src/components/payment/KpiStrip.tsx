import { formatCurrency } from "@/lib/formatters";
import type { PaymentCalculation } from "@/types/payment";

const ITEMS: Array<{ key: keyof Pick<PaymentCalculation, "toPay" | "gross" | "acquirer" | "margin" | "profit" | "toCash">; label: string }> = [
  { key: "toPay", label: "К оплате" },
  { key: "gross", label: "Gross" },
  { key: "acquirer", label: "Эквайер" },
  { key: "margin", label: "Маржа" },
  { key: "profit", label: "Профит" },
  { key: "toCash", label: "Получателю" },
];

export function KpiStrip({ calculation }: { calculation: PaymentCalculation }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-wrap items-end gap-x-8 gap-y-3 px-4 pt-6">
      {ITEMS.map((item) => (
        <div key={item.key} className="min-w-[7rem]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
          <p className="tabular text-lg font-medium">{formatCurrency(calculation[item.key])}</p>
        </div>
      ))}
    </div>
  );
}

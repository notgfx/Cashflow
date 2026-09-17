import { FlowConnector } from "@/components/payment/FlowConnector";
import { PaymentNode } from "@/components/payment/PaymentNode";
import { PaymentSplit } from "@/components/payment/PaymentSplit";
import { formatCurrency } from "@/lib/formatters";
import {
  formulaCoupon,
  formulaProfit,
  formulaReferral,
  formulaToCash,
} from "@/lib/formulaText";
import type { PaymentCalculation } from "@/types/payment";

type ProfitBreakdownProps = {
  calculation: PaymentCalculation;
};

export function ProfitBreakdown({ calculation }: ProfitBreakdownProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <PaymentSplit columns={3} className="max-w-5xl">
        <PaymentNode
          title="Купон"
          value={formatCurrency(calculation.coupon)}
          formula={formulaCoupon(calculation)}
          variant="coupon"
        />
        <PaymentNode
          title="Реферал"
          value={formatCurrency(calculation.referral)}
          formula={formulaReferral(calculation)}
          variant="referral"
        />
        <PaymentNode
          title="Профит"
          value={formatCurrency(calculation.profit)}
          formula={formulaProfit(calculation)}
          variant="profit"
        />
      </PaymentSplit>
      <FlowConnector />
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">+</span>
      <PaymentNode
        title="Получателю"
        value={formatCurrency(calculation.toCash)}
        formula={formulaToCash(calculation)}
        variant="cash"
        className="mt-2 max-w-lg"
      />
    </div>
  );
}

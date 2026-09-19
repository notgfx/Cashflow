import { CommissionByUserHeart } from "@/components/payment/CommissionByUserHeart";
import { FlowConnector } from "@/components/payment/FlowConnector";
import { MarginNode } from "@/components/payment/MarginNode";
import { PaymentNode } from "@/components/payment/PaymentNode";
import { PaymentSplit } from "@/components/payment/PaymentSplit";
import { ProfitBreakdown } from "@/components/payment/ProfitBreakdown";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  formulaAcquirer,
  formulaCharge,
  formulaGross,
  formulaMargin,
  formulaToPay,
} from "@/lib/formulaText";
import { COMMISSION_BY_USER_LABEL, paymentSystemLabel } from "@/lib/labels";
import type { PaymentAnalysis } from "@/types/payment";

type PaymentFlowProps = {
  analysis: PaymentAnalysis;
};

export function PaymentFlow({ analysis }: PaymentFlowProps) {
  const { calculation, snapshot } = analysis;
  const method = paymentSystemLabel(calculation.paymentSystem);
  const tariffNote = snapshot?.tariffFromJson
    ? `Расчётный тариф ${formatPercent(calculation.tariff)}`
    : `Тариф ${formatPercent(calculation.tariff)}`;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-6">
      <PaymentNode
        title="Плательщик"
        value={formatCurrency(calculation.toPay)}
        subtitle={
          calculation.commissionByUser
            ? `${method} · ${tariffNote} · ${COMMISSION_BY_USER_LABEL}`
            : `${method} · ${tariffNote}`
        }
        formula={formulaToPay(calculation)}
        variant="payer"
        icon={<CommissionByUserHeart active={calculation.commissionByUser} />}
        className="max-w-lg"
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Ставка списания {formulaCharge(calculation)}
      </p>
      <FlowConnector />
      <PaymentSplit className="max-w-4xl">
        <PaymentNode
          title="Эквайер"
          value={formatCurrency(calculation.acquirer)}
          subtitle={
            calculation.acquirerRateKnown ? method : `${method} · ставка неизвестна`
          }
          formula={formulaAcquirer(calculation)}
          variant="acquirer"
        />
        <PaymentNode
          title="Gross сервиса"
          value={formatCurrency(calculation.gross)}
          formula={formulaGross(calculation)}
          variant="gross"
        />
      </PaymentSplit>
      <FlowConnector />
      <MarginNode value={formatCurrency(calculation.margin)} formula={formulaMargin(calculation)} />
      <FlowConnector />
      <ProfitBreakdown calculation={calculation} />
    </section>
  );
}

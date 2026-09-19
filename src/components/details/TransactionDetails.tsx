import type { ReactNode } from "react";
import { CommissionByUserHeart } from "@/components/payment/CommissionByUserHeart";
import { formatCurrency, formatPercent, formatRate, MISSING } from "@/lib/formatters";
import {
  formulaAcquirer,
  formulaCoupon,
  formulaGross,
  formulaMargin,
  formulaProfit,
  formulaProfitAfterReferral,
  formulaReferral,
  formulaServiceCharge,
  formulaToCash,
  formulaToPay,
} from "@/lib/formulaText";
import { COMMISSION_BY_USER_LABEL, INVOICE_CBU_PROMO_HINT, payerLabel, paymentSystemLabel } from "@/lib/labels";
import { Separator } from "@/components/ui/separator";
import type { PaymentAnalysis } from "@/types/payment";

type RowProps = {
  label: string;
  value: ReactNode;
  hint?: string;
};

function Row({ label, value, hint }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <div>
        <p className="text-muted-foreground">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p> : null}
      </div>
      <div className="tabular text-right font-medium">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

type TransactionDetailsProps = {
  analysis: PaymentAnalysis;
};

export function TransactionDetails({ analysis }: TransactionDetailsProps) {
  const { calculation, snapshot } = analysis;
  const observed = snapshot?.observed;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-8">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Детали транзакции
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Платёж">
          <Row label="Сумма" value={formatCurrency(calculation.sum)} />
          <Row label="Стилизация" value={formatCurrency(calculation.styling)} />
          <Row label="К оплате" value={formatCurrency(calculation.toPay)} hint={formulaToPay(calculation)} />
          <Row
            label="Способ оплаты"
            value={paymentSystemLabel(calculation.paymentSystem)}
            hint={
              calculation.acquirerRateKnown
                ? undefined
                : "Нет в таблице ставок эквайера — 0% в расчёте не из справочника"
            }
          />
          <Row label="Кто платит комиссию" value={payerLabel(calculation.payer)} />
          <Row
            label="commission_by_user"
            value={
              <span className="inline-flex items-center justify-end gap-1.5">
                <CommissionByUserHeart active={calculation.commissionByUser} />
                {calculation.commissionByUser ? "Да" : "Нет"}
              </span>
            }
            hint={
              calculation.commissionByUser
                ? calculation.invoiceCbu
                  ? `${COMMISSION_BY_USER_LABEL}. ${INVOICE_CBU_PROMO_HINT}`
                  : COMMISSION_BY_USER_LABEL
                : calculation.sender
                  ? "Invoice без выбора отправителя оплатить комиссию"
                  : undefined
            }
          />
          <Row
            label="Тариф"
            value={formatPercent(calculation.tariff)}
            hint={snapshot?.tariffFromJson ? "Рассчитан из JSON, не из профиля получателя" : "Задан вручную"}
          />
        </Section>
        <Section title="Расходы">
          <Row
            label="Наценка сервиса до купона"
            value={formatCurrency(calculation.serviceCharge)}
            hint={formulaServiceCharge(calculation)}
          />
          <Row label="Gross сервиса" value={formatCurrency(calculation.gross)} hint={formulaGross(calculation)} />
          <Row
            label="Эквайер"
            value={formatCurrency(calculation.acquirer)}
            hint={formulaAcquirer(calculation)}
          />
        </Section>
        <Section title="Прибыль">
          <Row label="Маржа" value={formatCurrency(calculation.margin)} hint={formulaMargin(calculation)} />
          <Row label="Скидка по купону" value={formatCurrency(calculation.coupon)} hint={formulaCoupon(calculation)} />
          <Row
            label="Бонус пригласившему"
            value={formatCurrency(calculation.referral)}
            hint={formulaReferral(calculation)}
          />
          <Row label="Прибыль сервиса" value={formatCurrency(calculation.profit)} hint={formulaProfit(calculation)} />
          <Row
            label="После бонуса пригласившему"
            value={formatCurrency(calculation.profitAfterReferral)}
            hint={formulaProfitAfterReferral(calculation)}
          />
        </Section>
        <Section title="Получатель">
          <Row
            label="Комиссия сервиса"
            value={formatCurrency(calculation.commission)}
            hint={`${formatCurrency(calculation.serviceCharge)} − ${formatCurrency(calculation.coupon)}`}
          />
          <Row label="Получателю" value={formatCurrency(calculation.toCash)} hint={formulaToCash(calculation)} />
          {snapshot?.exchangeRate ? (
            <Row
              label="Расчётный курс"
              value={`${formatRate(snapshot.exchangeRate.rate)} ₽ / ${snapshot.exchangeRate.unitLabel}`}
              hint={`${formatCurrency(snapshot.exchangeRate.rubAmount)} ÷ ${formatRate(snapshot.exchangeRate.foreignAmount)}`}
            />
          ) : null}
          {observed ? (
            <>
              <Separator className="my-2" />
              <Row label="Статус в JSON" value={observed.status || MISSING} />
              <Row label="Валюта" value={observed.currency || MISSING} />
              <Row label="Создан" value={observed.createdAt || MISSING} />
            </>
          ) : null}
        </Section>
      </div>
    </section>
  );
}

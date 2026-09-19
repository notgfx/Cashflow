import { CommissionByUserHeart } from "@/components/payment/CommissionByUserHeart";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { hasAcquirerRate } from "@/lib/fees";
import { COMMISSION_BY_USER_LABEL, INVOICE_CBU_PROMO_HINT, PAYMENT_SYSTEM_LABELS } from "@/lib/labels";
import { PAYMENT_SYSTEMS, type ManualInputs as ManualValues } from "@/types/payment";

type ManualInputsProps = {
  value: ManualValues;
  tariffFromJson: boolean;
  onChange: (next: ManualValues) => void;
};

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function ManualInputs({ value, tariffFromJson, onChange }: ManualInputsProps) {
  function patch(partial: Partial<ManualValues>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Ручные параметры
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="cf-sum">Сумма</Label>
            <Input
              id="cf-sum"
              type="number"
              min={0}
              step="0.01"
              className="tabular"
              value={value.sum}
              onChange={(event) => patch({ sum: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-tariff">Тариф, %</Label>
            <Input
              id="cf-tariff"
              type="number"
              min={0}
              step="0.1"
              className="tabular"
              value={value.tariff}
              onChange={(event) => patch({ tariff: Number(event.target.value) })}
            />
            {tariffFromJson ? (
              <p className="text-xs text-muted-foreground">Из JSON, не из профиля получателя</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-coupon">Доля купона от маржи, %</Label>
            <Input
              id="cf-coupon"
              type="number"
              min={0}
              step="0.1"
              className="tabular"
              value={value.couponPct}
              onChange={(event) => patch({ couponPct: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-bonus">Доля бонуса пригласившему, %</Label>
            <Input
              id="cf-bonus"
              type="number"
              min={0}
              step="0.1"
              className="tabular"
              value={value.bonusPct}
              onChange={(event) => patch({ bonusPct: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-ps">Способ оплаты</Label>
            <select
              id="cf-ps"
              className={fieldClass}
              value={value.paymentSystem}
              onChange={(event) =>
                patch({ paymentSystem: event.target.value as ManualValues["paymentSystem"] })
              }
            >
              <option value="">Не указан</option>
              {value.paymentSystem &&
              !(PAYMENT_SYSTEMS as readonly string[]).includes(value.paymentSystem) ? (
                <option value={value.paymentSystem}>
                  {value.paymentSystem} (нет в справочнике)
                </option>
              ) : null}
              {PAYMENT_SYSTEMS.map((code) => (
                <option key={code} value={code}>
                  {PAYMENT_SYSTEM_LABELS[code]}
                </option>
              ))}
            </select>
            {!hasAcquirerRate(value.paymentSystem) ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Нет ставки эквайера в таблице — расчёт не подставляет 0% как известную комиссию
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="cf-payer">Кто платит комиссию</Label>
              <CommissionByUserHeart
                active={value.commissionByUser}
                interactive
                onToggle={() => patch({ commissionByUser: !value.commissionByUser })}
              />
            </div>
            <select
              id="cf-payer"
              className={fieldClass}
              value={value.payer}
              onChange={(event) => patch({ payer: event.target.value as ManualValues["payer"] })}
            >
              <option value="recipient">Получатель</option>
              <option value="sender">Отправитель</option>
            </select>
            {value.commissionByUser ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <CommissionByUserHeart active className="mt-0.5" />
                <span>{COMMISSION_BY_USER_LABEL}</span>
              </p>
            ) : null}
            {value.payer === "sender" && value.commissionByUser ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">{INVOICE_CBU_PROMO_HINT}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-style-mode">Стилизация</Label>
            <select
              id="cf-style-mode"
              className={fieldClass}
              value={value.stylingMode}
              onChange={(event) =>
                patch({ stylingMode: event.target.value as ManualValues["stylingMode"] })
              }
            >
              <option value="off">Нет</option>
              <option value="auto">Авто</option>
              <option value="custom">Своя сумма</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-style-amt">Сумма стилизации</Label>
            <Input
              id="cf-style-amt"
              type="number"
              min={0}
              step="0.01"
              className="tabular"
              disabled={value.stylingMode !== "custom"}
              value={value.stylingCustom}
              onChange={(event) => patch({ stylingCustom: Number(event.target.value) })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

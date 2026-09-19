import { useState } from "react";
import { CommissionByUserHeart } from "@/components/payment/CommissionByUserHeart";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { hasAcquirerRate } from "@/lib/fees";
import { COMMISSION_BY_USER_LABEL, PAYMENT_SYSTEM_LABELS } from "@/lib/labels";
import { PAYMENT_SYSTEMS, type ManualInputs as ManualValues } from "@/types/payment";
import { cn } from "@/lib/utils";

type ManualInputsProps = {
  value: ManualValues;
  tariffFromJson: boolean;
  onChange: (next: ManualValues) => void;
};

const fieldClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function parseNumericDraft(raw: string): number | null {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function NumericField({
  id,
  value,
  onChange,
  min = 0,
  step,
  disabled,
}: {
  id: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Input
      id={id}
      type="number"
      min={min}
      step={step}
      disabled={disabled}
      className="tabular"
      value={draft ?? value}
      onFocus={() => setDraft(String(value))}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        const parsed = parseNumericDraft(raw);
        if (parsed !== null) onChange(parsed);
      }}
      onBlur={() => {
        const parsed = parseNumericDraft(draft ?? String(value));
        onChange(parsed !== null ? Math.max(min, parsed) : 0);
        setDraft(null);
      }}
    />
  );
}

function PromoOffNote({ active }: { active: boolean }) {
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground",
        !active && "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <span>Не применяется при</span>
      <CommissionByUserHeart active />
    </p>
  );
}

export function ManualInputs({ value, tariffFromJson, onChange }: ManualInputsProps) {
  const invoiceCbu = value.payer === "sender" && value.commissionByUser;

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
            <NumericField
              id="cf-sum"
              min={0}
              step="0.01"
              value={value.sum}
              onChange={(sum) => patch({ sum })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-tariff">Тариф, %</Label>
            <NumericField
              id="cf-tariff"
              min={0}
              step="0.1"
              value={value.tariff}
              onChange={(tariff) => patch({ tariff })}
            />
            {tariffFromJson ? (
              <p className="text-xs text-muted-foreground">Из JSON, не из профиля получателя</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-coupon">Доля купона от маржи, %</Label>
            <NumericField
              id="cf-coupon"
              min={0}
              step="0.1"
              value={value.couponPct}
              onChange={(couponPct) => patch({ couponPct })}
            />
            <PromoOffNote active={invoiceCbu} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-bonus">Доля бонуса пригласившему, %</Label>
            <NumericField
              id="cf-bonus"
              min={0}
              step="0.1"
              value={value.bonusPct}
              onChange={(bonusPct) => patch({ bonusPct })}
            />
            <PromoOffNote active={invoiceCbu} />
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
              <option value="auto">Да</option>
              <option value="custom">Своя сумма</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-style-amt">Сумма стилизации</Label>
            <NumericField
              id="cf-style-amt"
              min={0}
              step="0.01"
              disabled={value.stylingMode !== "custom"}
              value={value.stylingCustom}
              onChange={(stylingCustom) => patch({ stylingCustom })}
            />
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
            <p
              className={cn(
                "flex items-start gap-1.5 text-xs text-muted-foreground",
                !value.commissionByUser && "pointer-events-none opacity-0",
              )}
              aria-hidden={!value.commissionByUser}
            >
              <CommissionByUserHeart active className="mt-0.5" />
              <span>{COMMISSION_BY_USER_LABEL}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

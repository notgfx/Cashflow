import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT_BORDER: Record<string, string> = {
  payer: "border-[color:var(--metric-payer)]/35",
  acquirer: "border-[color:var(--metric-acquirer)]/40",
  gross: "border-[color:var(--metric-gross)]/35",
  margin: "border-[color:var(--metric-margin)]/40",
  coupon: "border-[color:var(--metric-coupon)]/40",
  referral: "border-[color:var(--metric-referral)]/40",
  profit: "border-border",
  cash: "border-[color:var(--metric-cash)]/40",
  default: "border-border",
};

const VARIANT_TITLE: Record<string, string> = {
  payer: "text-[color:var(--metric-payer)]",
  acquirer: "text-[color:var(--metric-acquirer)]",
  gross: "text-[color:var(--metric-gross)]",
  margin: "text-[color:var(--metric-margin)]",
  coupon: "text-[color:var(--metric-coupon)]",
  referral: "text-[color:var(--metric-referral)]",
  profit: "text-muted-foreground",
  cash: "text-[color:var(--metric-cash)]",
  default: "text-muted-foreground",
};

export type MetricVariant =
  | "payer"
  | "acquirer"
  | "gross"
  | "margin"
  | "coupon"
  | "referral"
  | "profit"
  | "cash"
  | "default";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  description?: string;
  formula?: string;
  variant?: MetricVariant;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({
  title,
  value,
  subtitle,
  description,
  formula,
  variant = "default",
  icon,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/40",
        VARIANT_BORDER[variant],
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className={cn("text-[11px] font-medium uppercase tracking-[0.14em]", VARIANT_TITLE[variant])}>
          {title}
        </h3>
        {icon}
      </div>
      <p className="tabular text-2xl font-semibold tracking-tight md:text-[1.65rem]">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      {formula ? (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{formula}</p>
      ) : null}
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </article>
  );
}

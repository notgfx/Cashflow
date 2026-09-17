import type { ReactNode } from "react";
import { MetricCard, type MetricVariant } from "@/components/payment/MetricCard";
import { cn } from "@/lib/utils";

type PaymentNodeProps = {
  title: string;
  value: string;
  formula?: string;
  subtitle?: string;
  variant?: MetricVariant;
  className?: string;
  icon?: ReactNode;
};

export function PaymentNode(props: PaymentNodeProps) {
  return <MetricCard {...props} className={cn("w-full max-w-md", props.className)} />;
}

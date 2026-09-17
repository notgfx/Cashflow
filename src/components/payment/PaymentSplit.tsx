import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PaymentSplitProps = {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
};

export function PaymentSplit({ children, columns = 2, className }: PaymentSplitProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-3",
        columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
        "grid-cols-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

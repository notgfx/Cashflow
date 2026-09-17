import { formatCurrency } from "@/lib/formatters";
import type { FieldMismatch } from "@/types/payment";

export function MismatchNotice({ items }: { items: FieldMismatch[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="rounded-md border border-[color:var(--metric-acquirer)]/40 bg-card px-4 py-3 text-sm">
        <p className="font-medium">Модель и JSON немного расходятся</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {items.map((item) => (
            <li key={item.label}>
              {item.label}: расчёт {formatCurrency(item.calculated)}, в JSON {formatCurrency(item.observed)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

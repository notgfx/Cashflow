import type { AnalysisWarning } from "@/types/payment";

export function WarningNotice({ items }: { items: AnalysisWarning[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4">
      <div className="rounded-md border border-amber-500/50 bg-card px-4 py-3 text-sm">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.title}>
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

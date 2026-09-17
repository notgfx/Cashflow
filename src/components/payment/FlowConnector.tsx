import { cn } from "@/lib/utils";

type FlowConnectorProps = {
  label?: string;
  className?: string;
};

export function FlowConnector({ label, className }: FlowConnectorProps) {
  return (
    <div
      className={cn("flex flex-col items-center py-2 text-muted-foreground", className)}
      aria-hidden={label ? undefined : true}
    >
      <span className="h-5 w-px bg-border" />
      <span className="text-lg leading-none">↓</span>
      {label ? <span className="mt-1 text-xs">{label}</span> : null}
    </div>
  );
}

import { Heart } from "lucide-react";
import { COMMISSION_BY_USER_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type CommissionByUserHeartProps = {
  active: boolean;
  interactive?: boolean;
  onToggle?: () => void;
  className?: string;
};

export function CommissionByUserHeart({
  active,
  interactive = false,
  onToggle,
  className,
}: CommissionByUserHeartProps) {
  const heart = (
    <Heart
      className={cn(
        "h-3.5 w-3.5 shrink-0",
        active ? "fill-red-500 text-red-500" : "fill-transparent text-muted-foreground/30",
      )}
      aria-hidden
    />
  );

  if (!interactive) {
    return (
      <span
        className={cn("inline-flex size-4 shrink-0 items-center justify-center", className)}
        title={active ? COMMISSION_BY_USER_LABEL : undefined}
      >
        {heart}
      </span>
    );
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      aria-label={COMMISSION_BY_USER_LABEL}
      title={COMMISSION_BY_USER_LABEL}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm",
        "hover:bg-accent focus-visible:bg-accent",
        "outline-none focus-visible:outline-none",
        className,
      )}
    >
      {heart}
    </button>
  );
}

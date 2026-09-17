import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

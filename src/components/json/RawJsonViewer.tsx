import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RawJsonViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: unknown;
  fallbackText?: string;
};

export function RawJsonViewer({ open, onOpenChange, value, fallbackText }: RawJsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const pretty = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return fallbackText || "";
    }
  }, [fallbackText, value]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Исходный JSON</DialogTitle>
          <DialogDescription>Только просмотр. Данные остаются на этом устройстве.</DialogDescription>
        </DialogHeader>
        <div className="mb-3 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
            {copied ? "Скопировано" : "Копировать"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Свернуть" : "Развернуть"}
          </Button>
        </div>
        {expanded ? (
          <pre className="max-h-[60vh] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed">
            {pretty}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">JSON свёрнут.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

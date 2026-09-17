import { ClipboardPaste, FileJson, FolderOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  onPaste: () => void;
  onLoadFile: () => void;
  onExample: () => void;
  onRawJson: () => void;
  rawDisabled: boolean;
};

export function Header({ onPaste, onLoadFile, onExample, onRawJson, rawDisabled }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Cashflow</h1>
            <Badge>CLIENT-SIDE</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Payment calculation & transaction analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPaste}>
            <ClipboardPaste />
            Вставить JSON
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onLoadFile}>
            <FolderOpen />
            Загрузить файл
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onExample}>
            <Sparkles />
            Загрузить пример
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRawJson} disabled={rawDisabled} aria-label="Открыть исходный JSON">
            <FileJson />
            Raw JSON
          </Button>
        </div>
      </div>
    </header>
  );
}

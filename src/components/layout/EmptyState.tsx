import { ClipboardPaste, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onPaste: () => void;
  onLoadFile: () => void;
  onDropFile: (file: File) => void;
};

export function EmptyState({ onPaste, onLoadFile, onDropFile }: EmptyStateProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cashflow</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">Analyze a payment JSON</h2>
      <p className="mt-3 text-muted-foreground">
        Вставьте JSON платежа или загрузите файл. Расчёт выполняется локально.
      </p>
      <div
        className="mt-8 w-full rounded-lg border border-dashed border-border px-6 py-10"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onDropFile(file);
        }}
      >
        <p className="text-sm text-muted-foreground">Перетащите .json сюда</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={onPaste}>
            <ClipboardPaste />
            Paste JSON
          </Button>
          <Button type="button" variant="outline" onClick={onLoadFile}>
            <FolderOpen />
            Load JSON file
          </Button>
        </div>
      </div>
    </section>
  );
}

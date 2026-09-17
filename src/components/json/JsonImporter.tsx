import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InputError } from "@/types/payment";

type JsonImporterProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: InputError | null;
  onAnalyze: (raw: string) => void;
};

export function JsonImporter({ open, onOpenChange, error, onAnalyze }: JsonImporterProps) {
  const id = useId();
  const [text, setText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вставить JSON</DialogTitle>
          <DialogDescription>
            Данные обрабатываются только в браузере и никуда не отправляются.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={id}>JSON платежа</Label>
          <Textarea
            id={id}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder='{"sum":"10000.00", ...}'
            spellCheck={false}
          />
        </div>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
            <p className="font-medium">{error.title}</p>
            <p className="mt-1 text-muted-foreground">{error.detail}</p>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="button" onClick={() => onAnalyze(text)}>
            Анализировать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

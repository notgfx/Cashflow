import { useEffect, useMemo, useRef, useState } from "react";
import { TransactionDetails } from "@/components/details/TransactionDetails";
import { JsonImporter } from "@/components/json/JsonImporter";
import { RawJsonViewer } from "@/components/json/RawJsonViewer";
import { EmptyState } from "@/components/layout/EmptyState";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ManualInputs } from "@/components/manual/ManualInputs";
import { KpiStrip } from "@/components/payment/KpiStrip";
import { MismatchNotice } from "@/components/payment/MismatchNotice";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { analyzePayment, exampleSnapshot, ingestPayment } from "@/lib/input";
import { loadSession, saveSession } from "@/lib/storage";
import { formatRate } from "@/lib/formatters";
import type { InputError, ManualInputs as ManualValues, PaymentSnapshot } from "@/types/payment";

function readFile(file: File): Promise<string> {
  return file.text();
}

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [snapshot, setSnapshot] = useState<PaymentSnapshot | null>(null);
  const [inputs, setInputs] = useState<ManualValues | null>(null);
  const [cleared, setCleared] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [error, setError] = useState<InputError | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    if (stored?.cleared) {
      setCleared(true);
      setReady(true);
      return;
    }
    if (stored?.jsonText) {
      const result = ingestPayment({ kind: "text", raw: stored.jsonText });
      if (result.ok) {
        setSnapshot(result.value);
        setInputs(result.value.inferred);
        setReady(true);
        return;
      }
    }
    const demo = exampleSnapshot();
    setSnapshot(demo);
    setInputs(demo.inferred);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveSession({
      jsonText: snapshot?.rawText ?? null,
      cleared: cleared && !snapshot,
    });
  }, [cleared, ready, snapshot]);

  const analysis = useMemo(() => {
    if (!inputs) return null;
    return analyzePayment(snapshot, inputs);
  }, [inputs, snapshot]);

  function applySnapshot(next: PaymentSnapshot) {
    setSnapshot(next);
    setInputs(next.inferred);
    setCleared(false);
    setError(null);
    setPasteOpen(false);
  }

  function onAnalyzeText(raw: string) {
    const result = ingestPayment({ kind: "text", raw });
    if (!result.ok) {
      setError(result.error);
      setPasteOpen(true);
      return;
    }
    applySnapshot(result.value);
  }

  async function onFile(file: File) {
    try {
      const raw = await readFile(file);
      const result = ingestPayment({ kind: "file", name: file.name, raw });
      if (!result.ok) {
        setError(result.error);
        setPasteOpen(true);
        return;
      }
      applySnapshot(result.value);
    } catch (caught) {
      setError({
        title: "Не удалось прочитать файл",
        detail: caught instanceof Error ? caught.message : "Неизвестная ошибка",
      });
      setPasteOpen(true);
    }
  }

  function onExample() {
    const result = ingestPayment({ kind: "example" });
    if (result.ok) applySnapshot(result.value);
  }

  const fx = snapshot?.exchangeRate;

  return (
    <PageContainer>
      <Header
        onPaste={() => {
          setError(null);
          setPasteOpen(true);
        }}
        onLoadFile={() => fileRef.current?.click()}
        onExample={onExample}
        onRawJson={() => setRawOpen(true)}
        rawDisabled={!snapshot}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Загрузить JSON файл"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
          event.target.value = "";
        }}
      />

      {!analysis || !inputs ? (
        <EmptyState
          onPaste={() => setPasteOpen(true)}
          onLoadFile={() => fileRef.current?.click()}
          onDropFile={(file) => void onFile(file)}
        />
      ) : (
        <main className="animate-in fade-in duration-300">
          <KpiStrip calculation={analysis.calculation} />
          {fx ? (
            <p className="mx-auto max-w-5xl px-4 pt-4 text-sm text-muted-foreground">
              Расчётный курс: {formatRate(fx.rate)} ₽ / {fx.unitLabel}
            </p>
          ) : null}
          {analysis.calculation.acquirerFromRubGross ? (
            <p className="mx-auto max-w-5xl px-4 pt-2 text-sm text-muted-foreground">
              Для иностранной карты эквайер считается как 8.5% от рублёвой суммы с наценкой сервиса: поле «к оплате» в JSON может быть не в рублях.
            </p>
          ) : null}
          <PaymentFlow analysis={analysis} />
          <MismatchNotice items={analysis.mismatches} />
          <ManualInputs
            value={inputs}
            tariffFromJson={Boolean(snapshot?.tariffFromJson)}
            onChange={setInputs}
          />
          <TransactionDetails analysis={analysis} />
        </main>
      )}

      <Footer />
      <JsonImporter
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        error={error}
        onAnalyze={onAnalyzeText}
      />
      <RawJsonViewer
        open={rawOpen}
        onOpenChange={setRawOpen}
        value={snapshot?.raw}
        fallbackText={snapshot?.rawText}
      />
    </PageContainer>
  );
}

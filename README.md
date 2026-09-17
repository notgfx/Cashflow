# Cashflow

Статический фронтенд для анализа JSON платежа и ручного расчёта комиссий. Backend нет: все вычисления идут в браузере.

## Запуск

```bash
npm install
npm run dev
```

Сборка для GitHub Pages:

```bash
npm run build
```

Результат — `dist/`. Vite настроен с `base: './'`, поэтому сайт работает и в корне домена, и в подпути репозитория.


## Архитектура

- `src/lib/calculations.ts` — формулы (порт клиентской модели money-flow)
- `src/lib/input.ts` — импорт JSON: textarea, файл, пример; типы под будущие hash / postMessage
- `src/lib/formatters.ts` — `Intl.NumberFormat` (`ru-RU`, RUB)
- `src/types/payment.ts` — типы платежа и расчёта
- `src/components/payment/` — схема движения денег
- `src/components/json/` — вставка JSON и просмотр Raw JSON



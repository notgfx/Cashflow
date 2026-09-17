# Cashflow

Статический одностраничный фронтенд для анализа JSON платежа и ручного расчёта комиссий. Backend нет: парсинг и формулы выполняются только в браузере.

## Запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
```

Результат — `dist/`. Vite: `base: './'`, поэтому сайт работает и в корне домена, и в подпути GitHub Pages (`username.github.io/repo/`).

Локальная проверка production-сборки:

```bash
npm run preview
```

## GitHub Pages

1. В репозитории: Settings → Pages → Source = **GitHub Actions**.
2. Workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) на `push` в `main`/`master` собирает `npm ci && npm run build` и публикует `dist/`.
3. В `public/` лежит `.nojekyll`, чтобы Pages не обрабатывал статику через Jekyll.

## Архитектура

| Слой | Где |
|------|-----|
| Расчёты | `src/lib/calculations.ts` |
| Импорт JSON | `src/lib/input.ts` (`PaymentSource`: text, file, example; заготовки hash / postMessage) |
| Валидация | `src/lib/validators.ts` |
| Форматтеры | `src/lib/formatters.ts` (`Intl.NumberFormat`, `ru-RU`, RUB) |
| Типы | `src/types/payment.ts` |
| Схема денег | `src/components/payment/` |
| Вставка / Raw JSON | `src/components/json/` |
| Ручные поля | `src/components/manual/ManualInputs.tsx` |
| Демо | `src/data/example-payment.json` |

Графики в v1 не рисуются. Recharts не подключён: слой истории платежей можно добавить позже без смены импорта JSON.

## Tampermonkey (позже)

Сейчас нет POST и backend. Скрипт сможет передать JSON через тот же `ingestPayment()`:

- textarea / файл — уже есть;
- `postMessage` и URL hash — типы `PaymentSource` зарезервированы, реализация не включена.

## Конфиденциальность

Данные не уходят на сервер. В `localStorage` может сохраняться последняя JSON-строка (с ограничением размера).

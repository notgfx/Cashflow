# Cashflow
https://notgfx.github.io/Cashflow/

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

Результат — `dist/`. Vite: `base: './'`, поэтому сайт работает и в корне домена, и в подпути.

Локальная проверка production-сборки:

```bash
npm run preview
```

## Архитектура

| Слой | Где |
|------|-----|
| Расчёты | `src/lib/calculations.ts` |
| Импорт JSON | `src/lib/input.ts` (`PaymentSource`: text, file, example, hash; заготовка postMessage|
| Валидация | `src/lib/validators.ts` |
| Форматтеры | `src/lib/formatters.ts` (`Intl.NumberFormat`, `ru-RU`, RUB) |
| Типы | `src/types/payment.ts` |
| Схема денег | `src/components/payment/` |
| Вставка / Raw JSON | `src/components/json/` |
| Ручные поля | `src/components/manual/ManualInputs.tsx` |
| Демо | `src/data/example-payment.json` |

Графики в v1 не рисуются. Recharts не подключён: слой истории платежей можно добавить позже без смены импорта JSON.

## Tampermonkey

Backend не нужен: данные передаются через `location.hash`,
`ingestPayment()` разбирает их так же, как вставленный вручную JSON.

- textarea / файл / пример;
- `hash` — реализовано: userscript открывает `https://notgfx.github.io/Cashflow/#data=<encodeURIComponent(JSON.stringify(payment))>`
  для успешных донатов (`type === "donation"`, `status === "success"`);
  хэш разбирается один раз при загрузке и сразу вырезается из адресной строки;
- `postMessage` — тип `PaymentSource` зарезервирован, реализация не включена.

Данные не покидают браузер: скрипт делает `fetch` тем же
same-origin-запросом, что и раньше, а сайту передаёт их напрямую
через URL, без сервера-посредника.

## Конфиденциальность

Данные не уходят на сервер. В `localStorage` может сохраняться последняя JSON-строка (с ограничением размера).

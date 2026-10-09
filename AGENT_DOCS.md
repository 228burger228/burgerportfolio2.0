# Dmitry OS Agent — Полная документация

> Версия: 6.0 | Автор: Дмитрий (Burger) | Обновлено: сентябрь 2026

---

## Содержание

1. [О проекте (Портфолио)](#1-о-проекте-портфолио)
2. [Архитектура системы](#2-архитектура-системы)
3. [Команды и функции](#3-команды-и-функции)
4. [Установка и деплой](#4-установка-и-деплой)
5. [Файлы проекта](#5-файлы-проекта)
6. [Push-уведомления](#6-push-уведомления)
7. [Интеграции](#7-интеграции)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. О проекте (Портфолио)

### Dmitry OS Agent — персональный AI-ассистент в Telegram

Персональный AI-агент, построенный на базе Cloudflare Workers и Gemini API. Заменяет связку из нескольких приложений: Google Calendar, заметочник, трекер задач и AI-ассистент — всё через один Telegram-чат.

**Стек:** Cloudflare Workers (JS) · Google Apps Script · Gemini API · Telegram Bot API · Google Calendar API · Google Docs API · wttr.in

**Что умеет:**
- Распознаёт голосовые сообщения и сохраняет как заметки
- Анализирует изображения (дизайн-критика через Gemini Vision)
- Показывает реальную погоду с вело-индексом
- Управляет задачами с трекингом времени
- Создаёт события в Google Calendar через естественный язык
- Пишет заметки в Google Docs с автотегированием
- Автоматически шлёт пуши: пары, дедлайны, утро/вечер
- Работает в трёх AI-режимах: стратег, арт-директор, тренер английского

**Ключевые решения:**
- Serverless на Cloudflare Workers — нулевой cold start, 100k req/day бесплатно
- Google Apps Script как мост к Google API — без OAuth flow в боте
- Два независимых GAS проекта: bridge (синхронный) и push-engine (async cron)
- Кэширование Agent Memory в Cloudflare KV — контекст без лишних запросов
- wttr.in для погоды — zero-dependency, без API-ключей

**Показатели:**
- Latency ответа: ~300-800ms
- Стоимость: $0/мес (все сервисы в бесплатных тирах)
- Uptime: 99.9% (Cloudflare SLA)

---

## 2. Архитектура системы

### Схема компонентов

```
┌─────────────────────────────────────────────────────────┐
│                    📱 TELEGRAM                          │
│         (интерфейс — кнопки, команды, медиа)           │
└──────────────────────┬──────────────────────────────────┘
                       │ webhook POST
                       │
┌──────────────────────▼──────────────────────────────────┐
│              ☁️ CLOUDFLARE WORKERS                      │
│                   bot-v6.js                             │
│                                                         │
│  Обрабатывает:                                          │
│  • Текст → команды + Gemini AI                          │
│  • Голос → Gemini транскрипция → Docs                   │
│  • Фото  → Gemini Vision анализ                         │
└───────┬───────────────────────────┬─────────────────────┘
        │                           │
   Gemini API                Apps Script Bridge
        │                           │
┌───────▼──────────┐    ┌───────────▼──────────────────── ┐
│  🤖 GEMINI API   │    │  📋 GOOGLE APPS SCRIPT #1        │
│  gemini-3.6-flash│    │  google-bridge-v6.gs             │
│                  │    │                                  │
│  • Текст→ответ   │    │  • Calendar: read/write          │
│  • Аудио→текст   │    │  • Docs: заметки, задачи         │
│  • Фото→анализ   │    │  • Tasks: add/start/stop         │
│  • Парсинг дат   │    │  • Memory: read_log              │
└──────────────────┘    └──────┬───────────────┬───────────┘
                               │               │
                    ┌──────────▼──┐   ┌────────▼────────┐
                    │ 📅 GOOGLE   │   │ 📝 GOOGLE DOCS  │
                    │  CALENDAR   │   │  Agent Memory   │
                    │             │   │  (DOC_ID=1OS4z) │
                    │ Пары,       │   │  Заметки,       │
                    │ события,    │   │  задачи,        │
                    │ дедлайны    │   │  контекст,      │
                    └─────────────┘   │  отчёты         │
                                      └─────────────────┘

┌─────────────────────────────────────────────────────────┐
│         ⏰ GOOGLE APPS SCRIPT #2 (отдельный проект)     │
│              google-push-triggers.gs                    │
│                   каждые 15 минут                       │
│                                                         │
│  7:30 → утренняя сводка (погода + пары + дедлайн)       │
│  -30мин до пары → напоминание                           │
│  за 7/3/1 день → дедлайн-алерт                          │
│  21:00 → вечерний чекап                                 │
│  23:00 → ночной брифинг                                 │
└──────────────────────────┬──────────────────────────────┘
                           │ Telegram Bot API напрямую
                           ▼
                    📱 TELEGRAM (пуши)

┌─────────────────────────────────────────────────────────┐
│  🌤 WTTR.IN — погода без ключей                         │
│  https://wttr.in/Moscow?format=j1                       │
└─────────────────────────────────────────────────────────┘
```

### Потоки данных

**Текстовое сообщение:**
```
Telegram → Worker → (optional: Agent Memory) → Gemini → Worker → Telegram
```

**Голосовое сообщение:**
```
Telegram → Worker → Telegram Files API → Gemini (transcribe) → Apps Script → Docs → Telegram
```

**Сводка дня:**
```
Telegram → Worker → Apps Script → Calendar + Docs(tasks) + wttr.in → Worker → Telegram
```

**Автопуш:**
```
GAS Timer → Calendar + wttr.in → Telegram Bot API → Telegram
```

**Создание события:**
```
Telegram → Worker → Gemini (parse date) → Apps Script → Calendar → Worker → Telegram
```

### Файлы и их роли

| Файл | Где | Роль |
|------|-----|------|
| `bot-v6.js` | Cloudflare Workers | Главный обработчик |
| `google-bridge-v6.gs` | GAS Project #1 | Bridge к Google API |
| `google-push-triggers.gs` | GAS Project #2 | Push-движок |
| Google Calendar | Google | Расписание, события |
| Google Docs (Agent Memory) | Google | Память, заметки, задачи |

---

## 3. Команды и функции

### Кнопки меню

| Кнопка | Действие |
|--------|----------|
| ☀️ Сводка дня | Погода + пары из Calendar + задачи |
| 📌 Задачи | Список задач из Docs |
| 🗓 Планы: неделя и месяц | Стратегический план |
| 📝 Мои заметки | Инструкция по заметкам |
| 📊 Дневной отчет | Структурированный отчет через Gemini |
| 🎨 Арт-директор | AI-режим: критика дизайна |
| 💼 Совет директоров | AI-режим: стратегический анализ |
| 🇬🇧 MOVE English | AI-режим: тренировка английского |
| 📖 Гайд | Справка по командам |

### Текстовые команды

**Основные:**
```
/start          — запуск, показ меню
/brief          — сводка дня
/plans          — планы на неделю и месяц
/guide          — полный гайд
/report         — дневной отчет
```

**Задачи:**
```
/tasks                    — список всех задач
/task_add [название]      — добавить задачу
/task_start [название]    — начать с таймером
/task_stop [название]     — завершить, показать время
```

**Данные:**
```
/event [текст]    — создать событие в Calendar (NLP парсинг)
/note [текст]     — заметка в Google Docs
/memory           — загрузить Agent Memory в контекст
/refresh_memory   — сбросить кэш памяти
```

**AI-режимы:**
```
/director   — Совет директоров (ПОТОК, ПРОДУКТ, ДЕНЬГИ, РИСК)
/design     — Арт-директор (типографика, цвет, иерархия)
/english    — MOVE English тренер (A1-A2)
```

**Тестирование:**
```
/test_all       — список тест-команд
/test_weather   — проверить погоду
/test_calendar  — проверить Calendar
/test_note      — проверить Docs
/test_morning   — тест утреннего пуша
/test_evening   — тест вечернего пуша
/test_night     — тест ночного пуша
/test_deadline  — тест дедлайн-алерта
/test_class     — тест напоминания о паре
```

**Медиа (без команд):**
```
🎤 Голосовое  → транскрипция + сохранение в Docs
🖼 Фото       → анализ дизайна через Gemini Vision
```

### Примеры использования

```
/event Встреча с Григорием в пятницу в 16:00
/event Пары Фирменный стиль 15.09 с 14:00 до 15:30

/note #идея Сделать dark mode для Study Up
/note #задача Отправить письмо Наталье по ИУП
/note #грузия Узнать про визу Category D

/task_add Верстка брошюры InDesign
/task_start Верстка брошюры InDesign
[работаешь 2 часа]
/task_stop Верстка брошюры InDesign
→ ✅ Время: 2ч 0м
```

### Теги для заметок

| Тег | Назначение |
|-----|-----------|
| `#колледж` / `#учеба` | Учебные заметки |
| `#задача` / `#todo` | Активные задачи |
| `#проект` / `#дизайн` | Проектные заметки |
| `#грузия` | Планы переезда / Григорий |
| `#идея` / `#мысль` | Идеи для продуктов |
| `#финансы` | Лидген, заработок |

---

## 4. Установка и деплой

### Что нужно

- Аккаунт Cloudflare (бесплатный)
- Аккаунт Google (уже есть: derser21136@gmail.com)
- Telegram Bot Token (уже есть)

### Шаг 1: Google Apps Script — Bridge (Project #1)

1. [script.google.com](https://script.google.com) → **+ Новый проект**
2. Название: `Dmitry Agent Bridge`
3. Вставь код из `google-bridge-v6.gs`
4. Services → добавь: **Google Calendar API** + **Google Docs API**
5. Запусти `checkSetup()` → разреши доступ → проверь логи
6. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Скопируй URL → вставь в `BRIDGE_URL` в `bot-v6.js`

**Твой Bridge URL:**
```
https://script.google.com/macros/s/AKfycbxe3S8G9R_ic1zoADuys5d6CmbT57-gTkWU-pDogUltRSLAuZIZrRbHTy9iHhyUl0Gk/exec
```

### Шаг 2: Google Apps Script — Push Engine (Project #2)

1. [script.google.com](https://script.google.com) → **+ Новый проект**
2. Название: `Dmitry Agent Push`
3. Вставь код из `google-push-triggers.gs`
4. **НЕ нужен деплой** — только запустить `setupTriggers()` один раз
5. После запуска придёт Telegram-сообщение об активации
6. Проверь: слева ⏰ Triggers → должен быть `checkAndSendPushes` каждые 15 мин

### Шаг 3: Cloudflare Workers

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages
2. Create Worker → вставь код из `bot-v6.js`
3. **Save and Deploy**
4. Скопируй URL Worker: `https://late-poetry-fa06.derser21136.workers.dev`

### Шаг 4: Webhook Telegram

Открой в браузере (уже заполнено твоими данными):
```
https://api.telegram.org/bot8850245256:AAG1uVuNXbc2QcBY7FH8kMxxuaGX8XzEStY/setWebhook?url=https://late-poetry-fa06.derser21136.workers.dev
```

Ответ должен быть: `{"ok":true,"result":true}`

Проверка:
```
https://api.telegram.org/bot8850245256:AAG1uVuNXbc2QcBY7FH8kMxxuaGX8XzEStY/getWebhookInfo
```

### Шаг 5: Тестирование

В Telegram боту:
```
/start          → должна появиться клавиатура
/test_weather   → должна прийти погода
/test_calendar  → должен ответить статус Calendar
/test_note      → должна появиться заметка в документе
```

### Шаг 6: Добавить расписание пар

- **Вручную:** [calendar.google.com](https://calendar.google.com) → добавить события
- **Через бота:** `/event Фирменный стиль 15.09 14:00-15:30 ауд.301`

---

## 5. Файлы проекта

```
burgerAgent/
├── bot-v6.js                  ← Cloudflare Worker (основной)
├── bot.js                     ← старая версия (можно удалить)
├── google-bridge-v6.gs        ← GAS Bridge (актуальный)
├── google-bridge.gs           ← старая версия (можно удалить)
├── google-push-triggers.gs    ← GAS Push Engine
└── AGENT_DOCS.md              ← этот файл
```

**Ключевые константы в `bot-v6.js`:**
```javascript
BOT_TOKEN:   "8850245256:AAG1..."
GEMINI_KEY:  "AQ.Ab8RN6KSX..."
USER_ID:     "1577660217"
BRIDGE_URL:  "https://script.google.com/macros/s/AKfycb.../exec"
DOC_ID:      "1OS4z5kIUnH9qVpEjOKLoXn-6fojLZfQZqwtH1hDrFKY"
```

**Ключевые константы в `google-bridge-v6.gs`:**
```javascript
CALENDAR_ID: "derser21136@gmail.com"
DOC_ID:      "1OS4z5kIUnH9qVpEjOKLoXn-6fojLZfQZqwtH1hDrFKY"
```

---

## 6. Push-уведомления

### Расписание пушей

| Время МСК | Тип | Содержание |
|-----------|-----|------------|
| **07:30** | ☀️ Утро | Погода + пары + ближайший дедлайн |
| **За 30 мин до пары** | ⏰ Пара | Название, кабинет, совет |
| **За 7 дней** | 🟡 Дедлайн | Предупреждение |
| **За 3 дня** | 🟠 Дедлайн | Срочное предупреждение |
| **За 1 день** | 🔴 Дедлайн | Финальный алерт |
| **21:00** | 🌙 Вечер | Пары завтра + горящие дедлайны |
| **23:00** | 🌙 Ночь | Брифинг + рекомендуемый подъём |

### Текущие дедлайны

```javascript
{ title: "Брошюра InDesign 8 полос",      date: "2026-09-26" }
{ title: "ИУП — договор самозанятого",    date: "2026-09-30" }
{ title: "Ролик After Effects 2 мин",     date: "2026-10-07" }
{ title: "Очные пары заканчиваются",      date: "2026-10-12" }
```

Чтобы добавить новый дедлайн — в `google-push-triggers.gs` найди `var DEADLINES` и добавь строку.

### Изменить время пушей

В `google-push-triggers.gs`:
```javascript
var MORNING_HOUR = 7;   // час утренней сводки
var MORNING_MIN  = 30;  // минуты
var EVENING_HOUR = 21;  // час вечернего чекапа
var NIGHT_HOUR   = 23;  // час ночного брифинга
```

---

## 7. Интеграции

### Google Calendar
- **Чтение:** события на сегодня/завтра через `CalendarApp.getCalendarById()`
- **Запись:** создание событий через `calendar.createEvent()`
- **ID:** `derser21136@gmail.com`

### Google Docs (Agent Memory)
- **URL:** [открыть документ](https://docs.google.com/document/d/1OS4z5kIUnH9qVpEjOKLoXn-6fojLZfQZqwtH1hDrFKY/edit)
- **Чтение:** `/memory` команда или автозагрузка при каждом сообщении
- **Запись:** `/note`, голосовые заметки, `/report`, задачи
- **Структура документа:**
  - Раздел 1: Постоянный контекст (проекты, правила)
  - Раздел 2: Live Stream заметок из Telegram
  - `## АКТИВНЫЕ ЗАДАЧИ` — секция задач с таймерами

### Gemini API
- **Модель:** `gemini-3.6-flash`
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`
- **Авторизация:** `x-goog-api-key` header
- **Использование:** текст, транскрипция аудио, анализ изображений

### wttr.in (погода)
- **URL:** `https://wttr.in/Moscow?format=j1`
- **Без ключей**, бесплатно
- **Возвращает:** температуру, ветер, влажность, описание

### Вело-индекс (алгоритм)
```
score += temp(15-25°C) ? 5 : temp(10-30°C) ? 3 : 1
score += wind < 15km/h ? 3 : wind < 25km/h ? 1 : 0
score += humidity < 70% ? 2 : humidity < 85% ? 1 : 0
result = clamp(score, 0, 10)
```

### Промт для Gemini Spark (автосинхронизация)
Отправь этот промт в Gemini Spark для автоматической обработки заметок:

```
Ты — автономный AI-агент Дмитрия (Burger). Следи за Google Документом
(Agent Memory: https://docs.google.com/document/d/1OS4z5kIUnH9qVpEjOKLoXn-6fojLZfQZqwtH1hDrFKY/edit)
и синхронизируй данные в Google Calendar и Google Tasks (derser21136@gmail.com).

ЧТО ДЕЛАТЬ С НОВЫМИ ЗАПИСЯМИ (без пометок [ОБРАБОТАНО]):

1. #задача, #todo → создай задачу в Google Tasks, пометь [ОБРАБОТАНО ✅ DD.MM HH:MM]
2. встреча/созвон/дедлайн/в XX:XX → создай событие в Calendar, пометь [ОБРАБОТАНО ✅]
3. до/срок/сдать → создай событие+задачу с дедлайном, добавь напоминания -3д и -1д
4. #проект/#дизайн/#грузия → только пометь [ПРОЧИТАНО 👁]
5. #идея/#мысль → перенеси в раздел "Идеи", пометь [СОХРАНЕНО 💡]

ПРАВИЛА:
- Обрабатывай только строки БЕЗ пометок
- Голосовые заметки (🎤) обрабатывай как текстовые
- Не удаляй строки — только добавляй пометки
- Часовой пояс: Europe/Moscow (UTC+3)
- Проверяй каждые 30 минут

КОНТЕКСТ: студент МГКЭИТ 3ГД-1-24, дизайнер, пары 2-я смена с 14:00
```

---

## 8. Troubleshooting

### Error 1031 в Cloudflare
**Причина:** Worker не задеплоен или повреждён
**Решение:**
1. Workers & Pages → Worker → Edit code
2. Убедись что код вставлен и нажал именно **Save and Deploy** (не просто Save)
3. Если не помогает — создай новый Worker, задеплой туда, переустанови webhook

### Бот не отвечает
```
1. Проверь webhook:
   https://api.telegram.org/botТОКЕН/getWebhookInfo

2. Должно быть: "url": "https://ТВОй_WORKER.workers.dev"

3. Если URL пустой — переустанови webhook:
   https://api.telegram.org/botТОКЕН/setWebhook?url=https://ТВОй_WORKER.workers.dev

4. Логи в Cloudflare: Workers → твой Worker → Logs
```

### Календарь не работает (`/test_calendar`)
```
1. Открой GAS Bridge проект
2. Запусти checkSetup() → смотри логи
3. Должно быть: ✅ Календарь найден
4. Если нет — проверь CALENDAR_ID = "derser21136@gmail.com"
5. Убедись что GAS задеплоен (Deploy → Manage deployments → активный)
```

### Заметки не сохраняются (`/test_note`)
```
1. Проверь DOC_ID в google-bridge-v6.gs
2. DOC_ID = "1OS4z5kIUnH9qVpEjOKLoXn-6fojLZfQZqwtH1hDrFKY"
3. Запусти testCreateNote() в GAS → смотри логи
4. Убедись что Google Docs API включён в Services
```

### Пуши не приходят
```
1. Зайди в GAS Push проект
2. Слева ⏰ Triggers → должен быть checkAndSendPushes каждые 15 мин
3. Если нет — запусти setupTriggers() заново
4. Запусти testMorningBrief() вручную — должно прийти в Telegram
```

### Синтаксическая ошибка в GAS
```
Если ошибка при вставке кода в Apps Script:
- Используй только var (не const/let)
- Не используй template literals (`${...}`) — только конкатенацию "текст" + переменная
- Не используй for...of — только обычный for (var i=0; ...)
- Не используй spread оператор {...obj}
```

### Gemini не отвечает
```
1. Проверь GEMINI_KEY в bot-v6.js
2. Модель: gemini-3.6-flash
3. Логи в Cloudflare Workers покажут конкретную ошибку
```

---

*Последнее обновление: сентябрь 2026*
*Вопросы и правки — через Telegram бота*

# Дмитрий Бургер — Product-Oriented Frontend Engineer & UI/UX Lead

> **«Собираю хаос требований в работающую систему.»**  
> Проектирую интерфейсы и дизайн-системы в Figma, разрабатываю реактивные веб-сервисы на **React 19 / React 18 / Vue 3**, интерактивные **3D WebGL-проекты (Three.js / GLSL)** и высококонверсионные B2B-платформы с оценкой **Lighthouse 95+**.

---

## 🌐 Живые версии портфолио

| Формат | Описание | Ссылка |
| :--- | :--- | :--- |
| **1. Строгое B2B-портфолио (Main)** | Продуктовая витрина на языке функций, 3 ключевые боли бизнеса, живой `O(1)` поиск кейсов и реактивный калькулятор запуска MVP | [**228burger228.github.io/burgerportfolio2.0 ↗**](https://228burger228.github.io/burgerportfolio2.0/) |
| **2. Интерактивный 3D-мир (Game Portfolio 2.0)** | 3D-симулятор боевого вертолёта на чистом **Three.js + Vite**: кастомные GLSL-шейдеры воды и неба, `InstancedMesh`, HDR Bloom, 60 FPS и автопилот по 10 станциям за 60 секунд | [**228burger228.github.io/Game-portfolio ↗**](https://228burger228.github.io/Game-portfolio/) |
| **3. Telegram / Студийный бот** | Быстрая связь и интерактивный бот студии | [**@aimovl ↗**](https://t.me/aimovl) · [**@dmitryB_studio_bot ↗**](https://t.me/dmitryB_studio_bot) |

---

## ⚡ Ключевые особенности архитектуры (v2.0 Business Premium)

1. **Позиционирование на языке функций и бизнеса:**
   - Вместо абстрактных лозунгов — 3 направления (`UX/UI Архитектура`, `Frontend Инженерия`, `Product Delivery`) и разбор **3 главных болей бизнеса** (разрыв дизайна и верстки, затянутый Time-to-Market, медленные мобильные сайты).
2. **Структура кейсов «Слева направо» (`Было → Результат → Что стало`):**
   - Каждый кейс показывает исходную проблему клиента, измеримый коммерческий результат простым языком и итоговое инженерное решение.
   - Полноширинные флагманские карточки (**HgStroy B2B**, **Game Portfolio 2.0 — 3D Three.js**) и симметричная сетка ключевых продуктов (**EuroPath EdTech на React 19**, **Ainala Rehab MedTech SPA**, **Warpath Wiki 10 000+ чел/мес**, **Study Up**, **vertical.team**, **Dmitry OS AI**, **foodiCE**, **Dimutri & Burger**, **Digital Garden**).
   - Отдельная компактная полка **«Другие проекты, графика и архив»** (3 колонки с модальными галереями).
3. **Реактивный конфигуратор запуска MVP (`#calculator`):**
   - Построен на базе легковесного реактивного стора **`createReactiveStore` (Proxy Signals + React Hooks паттерн)** с автоматическим сохранением выбора в `localStorage`.
   - 4 шага: выбор задачи (включая **3D WebGL / Three.js спецпроект**), состояние проекта, темп запуска и мультивыбор **дополнительных модулей** (`AI / LLM`, `UI-кит в Figma`, `3D / Motion`, `SEO 95+`, `Аналитика & CRM`).
   - Динамическая генерация стека, архитектуры, маршрута запуска и готового ТЗ с отправкой в Telegram в один клик.
4. **Мгновенный поиск по проектам (`O(1)` Memory Index + `Ctrl+K`):**
   - При инициализации формируется поисковый индекс карточек в памяти без повторного чтения DOM при вводе текста.
   - Поддержка горячей клавиши **`Ctrl + K` / `⌘ + K`** для быстрого фокуса на поиске.
5. **Оптимизированный рендер-пайплайн (`js/main.js`):**
   - Единый `requestAnimationFrame` цикл скролла вместо разрозненных слушателей.
   - Отслеживание активных секций через `IntersectionObserver` (ноль принудительных синхронных перерасчетов геометрии — Zero Forced Reflow).
   - Централизованный диспетчер клавиатуры (`Escape`, `ArrowLeft`/`ArrowRight`, `Ctrl+K`).
6. **Чистая векторная графика (Zero Emojis):**
   - Все иконки выполнены инлайновыми векторами в стиле **Lucide / Feather Icons** (`stroke="currentColor"`, `stroke-width="1.75..2"`), без внешних шрифтов и тяжелых CDN.

---

## 🛠️ Технологический стек

- **Frontend & UI:** `HTML5 (Semantic)`, `CSS3 Design Tokens`, `JavaScript (ES6+)`, `Tailwind CSS v4`
- **Frameworks & 3D:** `React 19`, `React 18`, `Vue 3`, `Three.js / WebGL`, `GLSL Shaders`, `Vite`
- **Backend & Cloud / AI:** `Supabase`, `Cloudflare Workers (Serverless)`, `Gemini API`, `Telegram Bot API`
- **Design & Quality:** `Figma (Design Systems, Auto Layout, Tokens)`, `Lighthouse 95+`, `WCAG 2.1 AA`

---

## 📁 Структура репозитория

```text
├── index.html                  # Главная страница (Hero, Боли бизнеса, Кейсы, Архив, Калькулятор MVP)
├── css/
│   ├── tokens.css              # Система дизайн-токенов (палитра, типографика, отступы)
│   ├── base.css                # Сброс стилей и базовая типографика
│   ├── layout.css              # Сетки, карточки кейсов, 3D-баннер, B2B-калькулятор, модалки
│   ├── components.css          # Кнопки, бейджи, навигация, формы
│   └── responsive.css          # Адаптивные правила для планшетов и смартфонов
├── js/
│   └── main.js                 # Реактивный стор калькулятора, rAF-скролл, O(1) поиск, галереи
├── portfolio-data.json         # Структурированная база проектов и компетенций
├── GITHUB_UPDATE_PLAN.md       # Шпаргалка по обновлению файлов на GitHub
└── README.md                   # Документация репозитория
```

---

## 🚀 Быстрое обновление на GitHub

```bash
git add index.html mefoto.jpg css/layout.css css/responsive.css js/main.js portfolio-data.json README.md GITHUB_UPDATE_PLAN.md
git commit -m "feat: add 3D Game Portfolio showcase, upgrade reactive MVP calculator & optimize main.js"
git push origin main
```

---

## 📬 Контакты

- **Telegram:** [@aimovl](https://t.me/aimovl)
- **GitHub:** [github.com/228burger228](https://github.com/228burger228)
- **3D Game Portfolio:** [228burger228.github.io/Game-portfolio](https://228burger228.github.io/Game-portfolio/)

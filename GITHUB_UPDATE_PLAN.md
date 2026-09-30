# 📦 План и инструкция по обновлению портфолио на GitHub

Репозиторий: **[github.com/228burger228/burgerportfolio2.0](https://github.com/228burger228/burgerportfolio2.0)**  
Живой сайт: **[228burger228.github.io/burgerportfolio2.0](https://228burger228.github.io/burgerportfolio2.0/)**  
3D-игра (Three.js): **[228burger228.github.io/Game-portfolio](https://228burger228.github.io/Game-portfolio/)**

---

## ✅ Какие файлы изменились и готовы к загрузке

1. **`index.html`** *(в корне)*
   - Добавлена кнопка **«3D-версия (Three.js) ↗»** на главном экране (Hero).
   - На 3-м ряду в сетке кейсов (сразу после `HgStroy` и двух малых карточек `Warpath Wiki` + `Study Up`) добавлена полноширинная карточка **«Game Portfolio 2.0 — 3D Боевой Вертолёт и интерактивный мир»** с HUD-превью и ссылкой на игру.
   - Обновлены чипы технологий (`React 18`, `Three.js / WebGL`, `GLSL Shaders`).
   - В **Калькулятор запуска MVP** добавлена опция **«3D WebGL / Интерактивный спецпроект»**, 4-й шаг с мультивыбором **дополнительных модулей** (`AI / LLM`, `UI-кит в Figma`, `3D / Motion`, `SEO & Скорость 95+`, `Аналитика & CRM`), строка архитектуры и кнопка `Сбросить`.
   - Все эмодзи заменены на чистые векторные SVG-иконки (стиль Lucide).

2. **`css/layout.css`** *(в папке `css/`)*
   - Стили для полноширинной карточки 3D-игры (`.game-preview-banner`, `.game-preview-grid`, `.game-hud-top`).
   - Стили для новых модулей калькулятора (`.calc-addons-grid`, `.calc-addon-btn`, `.summary-meta-grid`, `.summary-reset-btn`).
   - Стили радио-индикаторов, полки архива и векторных бейджей.

3. **`css/responsive.css`** *(в папке `css/`)*
   - Мобильная адаптивность для калькулятора, строки поиска и сетки кейсов.

4. **`js/main.js`** *(в папке `js/`)*
   - Внедрен реактивный стор `createReactiveStore` (на базе `Proxy` и паттерна React Hooks) с автосохранением в `localStorage`.
   - Единый `requestAnimationFrame`-пайплайн скролла (вместо 3 отдельных слушателей).
   - Подсветка активного меню через `IntersectionObserver` (без нагрузки на процессор при прокрутке).
   - Предварительная индексация поиска проектов в памяти (`O(1)` поиск + горячая клавиша `Ctrl+K` / `⌘+K`).
   - Единый диспетчер клавиатуры (`Escape`, стрелки галереи, `Ctrl+K`).

5. **`mefoto.jpg`** *(в корне)*
   - Фотография для главного экрана Hero.

6. **`portfolio-data.json` и `README.md`** *(в корне)*
   - Актуализированные данные о проектах (включая 3D-игру) и новое описание репозитория для GitHub.

---

## 🚀 Как загрузить изменения на GitHub

### Вариант А: Через терминал (Git)
Выполни в папке проекта:

```bash
git status
git add index.html mefoto.jpg css/layout.css css/responsive.css js/main.js portfolio-data.json README.md GITHUB_UPDATE_PLAN.md
git commit -m "feat: add 3D Game Portfolio card, reactive MVP calculator addons, and rAF/O(1) JS optimizations"
git push origin main
```

### Вариант Б: Через веб-интерфейс GitHub (Drag & Drop)
1. Открой `https://github.com/228burger228/burgerportfolio2.0`.
2. В корень репозитория перетащи (`Add file` → `Upload files`):
   - `index.html`
   - `mefoto.jpg`
   - `portfolio-data.json`
   - `README.md`
   - `GITHUB_UPDATE_PLAN.md`
3. Зайди в папку **`css/`** на GitHub и загрузи туда:
   - `layout.css`
   - `responsive.css`
4. Зайди в папку **`js/`** на GitHub и загрузи туда:
   - `main.js`
5. Нажми зеленую кнопку **«Commit changes»**. Через 1–2 минуты GitHub Pages автоматически обновит сайт!

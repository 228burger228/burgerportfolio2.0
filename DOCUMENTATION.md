# Portfolio v2.0 — Полная документация

## 📖 Содержание

1. [Обзор](#обзор)
2. [Структура проекта](#структура-проекта)
3. [Быстрые команды](#быстрые-команды)
4. [Добавить новый проект](#добавить-новый-проект)
5. [Обновить контент](#обновить-контент)
6. [Изменить дизайн](#изменить-дизайн)
7. [Добавить новую секцию](#добавить-новую-секцию)
8. [Отслеживать производительность](#отслеживать-производительность)
9. [Решение проблем](#решение-проблем)
10. [Регулярное обслуживание](#регулярное-обслуживание)
11. [Деплой на GitHub Pages](#деплой-на-github-pages)
12. [Архитектура кода](#архитектура-кода)
13. [Кастомизация](#кастомизация)

---

## 🎯 Обзор

**Portfolio v2.0** — это production-ready портфолио с:
- Single-page layout с плавной прокруткой
- Animated stats, marquee, scroll reveal
- Project cards с фильтрацией и hover-эффектами
- Полная доступность (WCAG 2.1 AA)
- Lighthouse 95+ на всех метриках
- Семантический HTML5, чистый CSS, vanilla JS

**Технологии**: HTML5, CSS3, JavaScript ES6+, Figma

**Браузеры**: Chrome, Firefox, Safari, Edge (последние 2 версии)

---

## 📁 Структура проекта

```
burgerportfolio2.0/
├── index.html                    # Главная страница (семантический HTML5)
├── css/
│   ├── tokens.css               # Design токены (цвета, типография, спейсинг)
│   ├── base.css                 # Глобальные стили и типография
│   ├── layout.css               # Макет, секции, карточки, анимации
│   ├── components.css           # Кнопки, навигация, утилиты
│   └── responsive.css           # Адаптив (768px, 480px breakpoints)
├── js/
│   └── main.js                  # Вся логика (navbar, scroll reveal, фильтр, счётчики)
├── *.png                        # Скриншоты проектов
├── *.pdf                        # Документы и работы
├── .gitignore
├── README.md                    # Основная документация
├── SETUP.md                     # Инструкция по установке
└── DOCUMENTATION.md             # Этот файл
```

### Размеры файлов

- `index.html` — ~15 KB
- `css/` — ~25 KB (все файлы вместе)
- `js/main.js` — ~8 KB
- **Итого**: ~50 KB (без изображений)

---

## ⚡ Быстрые команды

### Локальная разработка

```bash
# Просто открой index.html в браузере
# Или используй live server в VS Code (F5)

# Проверить Lighthouse
# Chrome DevTools → Lighthouse → Analyze page load
```

### Git операции

```bash
# Проверить статус
git status

# Добавить все изменения
git add .

# Коммит
git commit -m "feat: описание изменения"

# Пуш на GitHub
git push origin main

# Пуш на GitHub Pages (автоматический)
# GitHub Actions запустится автоматически
```

### Проверить ошибки

```bash
# Открой DevTools (F12)
# Console → проверь что нет красных ошибок
# Network → проверь что все файлы загружаются (200 статус)
```

---

## ➕ Добавить новый проект

### Шаг 1: Подготовить изображение

1. Сделай скриншот проекта (1200x800px минимум)
2. Оптимизируй размер (используй TinyPNG или ImageOptim)
3. Сохрани как `project-name.png` в корень папки

### Шаг 2: Добавить HTML в index.html

Найди секцию `<!-- Projects grid -->` и добавь новую карточку:

```html
<!-- New Project -->
<article class="proj-card reveal" data-filter="frontend" aria-label="Проект название">
  <div class="proj-img">
    <img src="project-name.png" alt="Описание проекта" loading="lazy" />
    <div class="proj-overlay">
      <a href="https://link-to-project.com" target="_blank" rel="noopener noreferrer" class="proj-overlay-btn">
        Открыть проект ↗
      </a>
    </div>
    <div class="proj-badge">Badge</div>
  </div>
  <div class="proj-body">
    <div class="proj-tags">
      <span class="proj-tag">HTML/CSS/JS</span>
      <span class="proj-tag">Figma</span>
    </div>
    <h3 class="proj-title">Название проекта</h3>
    <p class="proj-desc">Краткое описание проекта (1-2 предложения).</p>
    <div class="proj-meta">
      <span class="proj-year">2025</span>
      <span class="proj-role">Твоя роль</span>
    </div>
  </div>
</article>
```

### Шаг 3: Выбрать фильтр

Используй `data-filter` для категоризации:
- `featured` — ключевые проекты (показываются в фильтре "Ключевые")
- `frontend` — frontend проекты
- `ui` — UI/UX дизайн
- Комбинируй: `data-filter="featured frontend"`

### Шаг 4: Выбрать badge (опционально)

```html
<!-- Lead Dev -->
<div class="proj-badge">Lead Dev</div>

<!-- Government project -->
<div class="proj-badge proj-badge-gov">Гос. проект</div>

<!-- Partnership -->
<div class="proj-badge proj-badge-partner">Партнёрство</div>
```

### Шаг 5: Коммит и пуш

```bash
git add .
git commit -m "feat: add new project - project-name"
git push origin main
```

---

## 📝 Обновить контент

### Изменить текст в hero

Найди в `index.html`:
```html
<p class="hero-role">Design-Driven Product & Technical Lead</p>
<h1 id="hero-title" class="hero-title">Создаю продукты от концепции до production.</h1>
<p class="hero-description">Работаю на стыке дизайна, инженерии...</p>
```

Отредактируй текст и пуши.

### Изменить текст в секциях

Все текстовые секции находятся в `index.html`. Просто найди нужный текст и отредактируй.

### Обновить контакты

Найди секцию `<!-- SECTION 8: CONTACT -->` и обнови ссылки:
```html
<a href="https://t.me/aimovl" target="_blank" rel="noopener noreferrer">
  Написать в Telegram
</a>
<a href="https://github.com/228burger228" target="_blank" rel="noopener noreferrer">
  GitHub
</a>
```

### Обновить год в footer

Найди в `index.html`:
```html
<p class="footer-text">
  © 2026 Дмитрий (Burger). Design-Driven Product & Technical Lead.
</p>
```

Измени год если нужно.

---

## 🎨 Изменить дизайн

### Изменить цвета

Открой `css/tokens.css` и найди раздел `COLOR TOKENS`:

```css
:root {
  /* Accent color */
  --color-accent: #3b82f6;           /* Измени это */
  --color-accent-hover: #2563eb;
  --color-accent-active: #1d4ed8;
  
  /* Background colors */
  --color-bg-primary: #09090b;       /* Основной фон */
  --color-bg-surface: #18181b;       /* Фон карточек */
  --color-bg-elevated: #27272a;      /* Hover состояния */
  
  /* Text colors */
  --color-text-primary: #fafafa;     /* Основной текст */
  --color-text-secondary: #a1a1aa;   /* Вторичный текст */
  --color-text-muted: #71717a;       /* Приглушённый текст */
}
```

Все цвета в проекте используют эти переменные, поэтому изменение здесь повлияет везде.

### Изменить типографию

В `css/tokens.css`:
```css
--font-family-display: 'Inter', sans-serif;  /* Заголовки */
--font-family-body: 'Inter', sans-serif;     /* Текст */

--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 32px;
--font-size-4xl: 40px;
--font-size-5xl: 48px;
--font-size-6xl: 56px;
```

### Изменить спейсинг

В `css/tokens.css`:
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 96px;
```

### Изменить border-radius

В `css/tokens.css`:
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Изменить переходы (transitions)

В `css/tokens.css`:
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🔧 Добавить новую секцию

### Шаг 1: Добавить HTML

В `index.html` перед `</main>`:

```html
<!-- NEW SECTION -->
<section id="new-section" class="section section-new" aria-labelledby="new-title">
  <div class="container">
    <div class="section-header reveal">
      <h2 id="new-title" class="section-title">Название секции</h2>
      <p class="section-subtitle">Подзаголовок (опционально)</p>
    </div>
    <div class="new-grid">
      <!-- Контент -->
    </div>
  </div>
</section>
```

### Шаг 2: Добавить CSS

В `css/layout.css`:

```css
.section-new {
  background-color: var(--color-bg-primary);
}

.new-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
}
```

### Шаг 3: Обновить навигацию

В `index.html` найди `<ul class="navbar-menu">` и добавь:

```html
<li role="none"><a href="#new-section" class="nav-link" role="menuitem">Новая секция</a></li>
```

### Шаг 4: Обновить responsive

В `css/responsive.css` добавь в мобильный раздел:

```css
@media (max-width: 767px) {
  .new-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}
```

---

## 📊 Отслеживать производительность

### Lighthouse audit

1. Открой сайт в Chrome
2. DevTools → Lighthouse
3. Нажми "Analyze page load"
4. Целевые значения: **95+ на всех метриках**

Если ниже:
- **Performance**: Оптимизируй изображения, минифицируй CSS/JS
- **Accessibility**: Проверь контраст, ARIA labels, keyboard navigation
- **Best Practices**: Используй HTTPS, обновляй зависимости
- **SEO**: Добавь meta tags, структурируй контент

### Проверить доступность

1. DevTools → Lighthouse → Accessibility
2. Или используй axe DevTools расширение
3. Проверь:
   - Color contrast (минимум 4.5:1 для текста)
   - ARIA labels на интерактивных элементах
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader support

### Проверить мобильный вид

1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Проверь на iPhone SE, iPad, Android
3. Убедись что:
   - Текст читаемый
   - Кнопки кликабельны (минимум 44x44px)
   - Нет горизонтального скролла

---

## 🐛 Решение проблем

### Проект не отображается

**Проблема**: Новый проект не видно в сетке

**Решение**:
1. Проверь что `data-filter` указан правильно
2. Проверь что класс `proj-card` есть
3. Проверь что `reveal` класс есть (для анимации)
4. Очисти кэш браузера (Ctrl+Shift+Delete)

### Изображение не загружается

**Проблема**: Вместо картинки пустое место

**Решение**:
1. Проверь что файл существует в корне папки
2. Проверь что путь в `src` правильный (без папок)
3. Проверь что расширение файла правильное (.png, .jpg)
4. Оптимизируй размер файла (должен быть < 500KB)

### Стили не применяются

**Проблема**: Новый элемент выглядит странно

**Решение**:
1. Проверь что CSS файл подключен в `<head>`
2. Проверь что селектор правильный
3. Проверь что нет конфликтов с другими стилями
4. Используй DevTools → Inspect element для отладки

### Анимации не работают

**Проблема**: Элементы не появляются плавно при скролле

**Решение**:
1. Проверь что класс `reveal` есть на элементе
2. Проверь что `js/main.js` загружается (DevTools → Console)
3. Проверь что браузер поддерживает IntersectionObserver
4. Проверь что `prefers-reduced-motion` не включена в системе

### Фильтр проектов не работает

**Проблема**: Кнопки фильтра не переключают проекты

**Решение**:
1. Проверь что `data-filter` указан на каждой карточке
2. Проверь что `js/main.js` загружается без ошибок
3. Проверь что класс `filt-btn` есть на кнопках
4. Очисти кэш браузера

### Navbar не прилипает к верху

**Проблема**: Navbar не остаётся видимым при скролле

**Решение**:
1. Проверь что `.navbar` имеет `position: fixed`
2. Проверь что `z-index` достаточно высокий
3. Проверь что нет `overflow: hidden` на родителе

---

## 📈 Регулярное обслуживание

### Еженедельно
- [ ] Проверить что сайт работает на мобильных
- [ ] Проверить что все ссылки работают
- [ ] Проверить что нет ошибок в консоли (DevTools → Console)

### Ежемесячно
- [ ] Запустить Lighthouse audit
- [ ] Проверить доступность (axe DevTools)
- [ ] Обновить контент если нужно
- [ ] Проверить что GitHub Pages работает

### Ежеквартально
- [ ] Обновить зависимости (если используются)
- [ ] Проверить что все проекты актуальны
- [ ] Обновить контакты если изменились
- [ ] Проверить что нет мёртвых ссылок

---

## 🚀 Деплой на GitHub Pages

### Первый раз

```bash
# 1. Инициализируй git (если ещё не сделал)
git init

# 2. Добавь все файлы
git add .

# 3. Первый коммит
git commit -m "initial commit: portfolio v2.0"

# 4. Добавь remote (замени USERNAME на свой GitHub username)
git remote add origin https://github.com/USERNAME/burgerportfolio2.0.git

# 5. Пуши на main
git push -u origin main

# 6. В GitHub репозитории:
# Settings → Pages → Source: Deploy from a branch → main
```

### После каждого обновления

```bash
git add .
git commit -m "feat: описание изменения"
git push origin main
```

Сайт обновится автоматически на GitHub Pages через 1-2 минуты.

### Проверить что работает

1. Открой https://USERNAME.github.io/burgerportfolio2.0/
2. Проверь что все работает
3. Если не работает, проверь Settings → Pages

---

## 🏗️ Архитектура кода

### HTML структура

```
index.html
├── <head>
│   ├── Meta tags (charset, viewport, description)
│   ├── CSS links (tokens, base, layout, components, responsive)
│   └── Google Fonts
├── <body>
│   ├── <nav class="navbar"> — Фиксированная навигация
│   ├── <main id="main-content">
│   │   ├── Section 1: Hero
│   │   ├── Marquee
│   │   ├── Section 2: Trust
│   │   ├── Section 3: Case Studies (Projects)
│   │   ├── Section 4: Expertise
│   │   ├── Section 5: Services
│   │   ├── Section 6: About
│   │   ├── Section 7: Documents
│   │   └── Section 8: Contact
│   ├── <footer>
│   └── <script src="js/main.js">
```

### CSS архитектура

```
tokens.css
├── Color tokens
├── Typography tokens
├── Spacing tokens
├── Border radius tokens
├── Shadow tokens
├── Transition tokens
└── Z-index tokens

base.css
├── Reset & box model
├── Typography
├── Links
├── Lists
├── Buttons
├── Form elements
├── Images
├── Scrollbar
├── Selection
└── Accessibility

layout.css
├── Container
├── Sections
├── Scroll reveal animations
├── Hero
├── Marquee
├── Stats row
├── Trust layer
├── Project cards
├── Expertise
├── Services
├── About
├── Documents
├── Contact
└── Footer

components.css
├── Buttons (primary, secondary, ghost)
├── Navigation bar
├── Badges & tags
├── Cards
├── Dividers
├── Animations
└── Utility classes

responsive.css
├── Tablet (1024px)
├── Mobile (768px)
├── Small mobile (480px)
├── Landscape
├── High DPI
├── Touch devices
└── Print
```

### JavaScript архитектура

```
main.js
├── Portfolio class
│   ├── constructor()
│   ├── init()
│   ├── setupNavbar()
│   ├── setupMobileMenu()
│   ├── setupSmoothScroll()
│   ├── setupActiveNavLink()
│   ├── setupScrollReveal()
│   ├── setupProjectFilter()
│   ├── setupCounters()
│   ├── setupAccessibility()
│   ├── closeMobileMenu()
│   └── animateCounter()
└── DOMContentLoaded event listener
```

---

## 🎨 Кастомизация

### Изменить шрифт

1. Открой `css/tokens.css`
2. Найди `--font-family-display` и `--font-family-body`
3. Замени на нужный шрифт (например, 'Poppins', 'Roboto')
4. Добавь импорт в `<head>` если нужно

### Изменить палитру цветов

1. Открой `css/tokens.css`
2. Измени все цвета в разделе `COLOR TOKENS`
3. Используй инструменты вроде [Coolors](https://coolors.co/) для подбора палитры

### Добавить новый язык

1. Создай копию `index.html` как `index-ru.html`
2. Переведи весь текст
3. Обнови ссылки в навигации

### Добавить тёмный/светлый режим

1. Добавь toggle в navbar
2. Используй CSS переменные для переключения цветов
3. Сохрани выбор в localStorage

### Добавить форму контакта

1. Используй сервис вроде Formspree или Netlify Forms
2. Добавь `<form>` в секцию Contact
3. Обработай отправку в `main.js`

---

## 📚 Дополнительные ресурсы

- [MDN Web Docs](https://developer.mozilla.org/) — справка по HTML/CSS/JS
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) — доступность
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse) — производительность
- [GitHub Pages Docs](https://docs.github.com/en/pages) — деплой
- [CSS Tricks](https://css-tricks.com/) — советы по CSS
- [JavaScript.info](https://javascript.info/) — обучение JS

---

## 📞 Поддержка

Если что-то не работает:
1. Проверь DevTools → Console на ошибки
2. Проверь DevTools → Network на загрузку файлов
3. Очисти кэш браузера (Ctrl+Shift+Delete)
4. Перезагрузи страницу (Ctrl+F5)
5. Проверь этот документ в разделе "Решение проблем"

---

**Версия**: 2.0  
**Последнее обновление**: Июнь 2026  
**Статус**: Production-Ready  
**Автор**: Дмитрий (Burger)  
**GitHub**: https://github.com/228burger228/burgerportfolio2.0

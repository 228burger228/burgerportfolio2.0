# Инструкция по установке и развёртыванию

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируй репозиторий**
   ```bash
   git clone https://github.com/228burger228/burgerportfolio2.0.git
   cd burgerportfolio2.0
   ```

2. **Открой в браузере**
   ```bash
   # Вариант 1: Просто открой index.html
   # Вариант 2: Используй Live Server (VS Code extension)
   # Вариант 3: Используй Python
   python -m http.server 8000
   # Затем открой http://localhost:8000
   ```

3. **Проверь в браузере**
   - Открой DevTools (F12)
   - Перейди на вкладку Lighthouse
   - Запусти аудит
   - Проверь scores (должны быть 95+)

---

## 📁 Структура файлов

```
burgerportfolio2.0/
├── index.html                    # Главная страница
├── css/
│   ├── tokens.css               # Design токены
│   ├── base.css                 # Глобальные стили
│   ├── layout.css               # Макет и сетки
│   ├── components.css           # Компоненты
│   └── responsive.css           # Адаптив
├── js/
│   └── main.js                  # JavaScript логика
├── assets/
│   └── images/                  # Изображения
├── README.md                    # Документация
├── SETUP.md                     # Этот файл
└── .gitignore                   # Git ignore rules
```

---

## 🔧 Кастомизация

### 1. Изменить цвета

Отредактируй `css/tokens.css`:

```css
:root {
  /* Цвета */
  --color-bg-primary: #09090b;
  --color-accent: #3b82f6;      /* ← Измени это */
  
  /* Остальные токены... */
}
```

### 2. Изменить текст

Отредактируй `index.html`:

```html
<h1 class="hero-title">
  Создаю продукты от концепции до production.
  <!-- ↑ Измени это -->
</h1>
```

### 3. Добавить новую секцию

1. Добавь HTML в `index.html`:
   ```html
   <section id="new-section" class="section" aria-labelledby="new-title">
     <div class="container">
       <h2 id="new-title" class="section-title">Новая секция</h2>
       <!-- Контент -->
     </div>
   </section>
   ```

2. Добавь CSS в `css/layout.css`:
   ```css
   .section-new-section {
     background-color: var(--color-bg-primary);
   }
   ```

3. Обнови навигацию в `index.html`:
   ```html
   <li role="none"><a href="#new-section" class="nav-link">Новая</a></li>
   ```

### 4. Добавить изображение

1. Положи изображение в `assets/images/`
2. Добавь в HTML:
   ```html
   <img src="assets/images/my-image.jpg" alt="Описание изображения" />
   ```

---

## 🌐 Развёртывание на GitHub Pages

### Вариант 1: Автоматический деплой (GitHub Actions)

1. **Создай `.github/workflows/deploy.yml`**:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./
   ```

2. **Запуши в main**:
   ```bash
   git add .
   git commit -m "Deploy portfolio"
   git push origin main
   ```

3. **Проверь GitHub Pages settings**:
   - Перейди в Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

### Вариант 2: Ручной деплой

1. **Создай ветку gh-pages**:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   ```

2. **Скопируй файлы**:
   ```bash
   git checkout main -- index.html css/ js/ assets/
   ```

3. **Запуши**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. **Вернись на main**:
   ```bash
   git checkout main
   ```

---

## ✅ Чеклист перед деплоем

### Функциональность

- [ ] Все ссылки работают
- [ ] Мобильное меню открывается/закрывается
- [ ] Smooth scroll работает
- [ ] Keyboard navigation работает (Tab, Enter, Escape)
- [ ] Все внешние ссылки открываются в новой вкладке

### Доступность

- [ ] Lighthouse Accessibility: 95+
- [ ] Keyboard navigation полная
- [ ] Screen reader работает
- [ ] Color contrast хороший
- [ ] Focus states видны

### Производительность

- [ ] Lighthouse Performance: 95+
- [ ] Lighthouse Best Practices: 95+
- [ ] Lighthouse SEO: 95+
- [ ] Нет console errors
- [ ] Нет console warnings

### Адаптив

- [ ] Desktop (1200px+) выглядит хорошо
- [ ] Tablet (768px-1199px) выглядит хорошо
- [ ] Mobile (< 768px) выглядит хорошо
- [ ] Нет горизонтального скролла

### Браузеры

- [ ] Chrome/Edge работает
- [ ] Firefox работает
- [ ] Safari работает
- [ ] Mobile Chrome работает
- [ ] Mobile Safari работает

---

## 🐛 Решение проблем

### Проблема: Стили не загружаются

**Решение**: Проверь пути к CSS файлам в `index.html`:
```html
<link rel="stylesheet" href="css/tokens.css" />
<link rel="stylesheet" href="css/base.css" />
<!-- и т.д. -->
```

### Проблема: JavaScript не работает

**Решение**: Проверь путь к JS файлу:
```html
<script src="js/main.js" defer></script>
```

### Проблема: Изображения не загружаются

**Решение**: Проверь пути:
```html
<!-- Правильно -->
<img src="assets/images/photo.jpg" alt="Фото" />

<!-- Неправильно -->
<img src="/assets/images/photo.jpg" alt="Фото" />
```

### Проблема: GitHub Pages показывает 404

**Решение**:
1. Проверь, что репозиторий публичный
2. Проверь GitHub Pages settings
3. Убедись, что файлы в правильной ветке (gh-pages или main)
4. Подожди 1-2 минуты для обновления

### Проблема: Lighthouse score низкий

**Решение**:
1. Запусти Lighthouse audit
2. Прочитай рекомендации
3. Исправь проблемы
4. Запусти audit снова

---

## 📊 Мониторинг

### Проверка производительности

```bash
# Используй Lighthouse CLI
npm install -g lighthouse
lighthouse https://228burger228.github.io/burgerportfolio2.0/ --view
```

### Проверка доступности

```bash
# Используй axe DevTools
# Chrome: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnkpklempisson
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/axe-devtools/
```

---

## 🔄 Обновление контента

### Добавить новый проект

1. Отредактируй `index.html`
2. Найди секцию `<!-- CASE STUDIES -->`
3. Добавь новую карточку проекта:
   ```html
   <article class="case-study">
     <div class="case-study-header">
       <h3 class="case-study-title">Название проекта</h3>
       <p class="case-study-meta">Год · Роль · Тип</p>
     </div>
     <!-- Остальное содержимое -->
   </article>
   ```

### Добавить новый документ

1. Положи PDF в корневую папку
2. Отредактируй `index.html`
3. Найди секцию `<!-- DOCUMENTS -->`
4. Добавь новую карточку:
   ```html
   <article class="document-card">
     <div class="document-icon">📄</div>
     <h3 class="document-card-title">Название</h3>
     <p class="document-card-description">Описание</p>
     <a href="file.pdf" target="_blank" class="btn btn-secondary">
       Скачать PDF
     </a>
   </article>
   ```

---

## 📞 Поддержка

Если у тебя есть вопросы:

1. Проверь README.md
2. Проверь SETUP.md (этот файл)
3. Запусти Lighthouse audit
4. Проверь console errors (F12 → Console)
5. Создай Issue на GitHub

---

## 🎓 Полезные ресурсы

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [CSS Tricks](https://css-tricks.com/)

---

**Версия**: 2.0  
**Последнее обновление**: Май 2026  
**Статус**: Production-Ready

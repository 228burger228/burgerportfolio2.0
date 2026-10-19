/* ═══════════════════════════════════════════════════════════════════════════
   MAIN.JS — Portfolio v2.0 (Optimized Reactive Architecture)
   - Reactive Store (Proxy Signals / React-like State & Persistence)
   - Unified requestAnimationFrame Scroll Pipeline (Zero Layout Thrashing)
   - Pre-indexed O(1) Project Search + Debounce
   - Centralized Keyboard Dispatcher (Escape, Arrows, Ctrl+K Search Focus)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Lightweight Reactive Store (React useState/useEffect + Proxy Signals pattern)
 * Обеспечивает реактивное управление состоянием и синхронизацию с localStorage
 */
function createReactiveStore(initialState, storageKey = null) {
  let saved = {};
  if (storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch (_) {
      saved = {};
    }
  }

  const internalState = { ...initialState, ...saved };
  const listeners = new Set();

  const notify = () => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(internalState));
      } catch (_) {}
    }
    listeners.forEach(fn => fn(internalState));
  };

  const proxy = new Proxy(internalState, {
    set(target, prop, value) {
      if (target[prop] !== value) {
        target[prop] = value;
        notify();
      }
      return true;
    }
  });

  return {
    state: proxy,
    setState(partial) {
      let changed = false;
      Object.keys(partial).forEach(key => {
        if (internalState[key] !== partial[key]) {
          internalState[key] = partial[key];
          changed = true;
        }
      });
      if (changed) notify();
    },
    reset() {
      Object.keys(initialState).forEach(key => {
        internalState[key] = Array.isArray(initialState[key])
          ? [...initialState[key]]
          : initialState[key];
      });
      notify();
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(internalState);
      return () => listeners.delete(fn);
    }
  };
}

class Portfolio {
  constructor() {
    this.navbar          = document.querySelector('.navbar');
    this.navToggle       = document.getElementById('navbar-toggle');
    this.navMenu         = document.getElementById('navbar-menu');
    this.navLinks        = document.querySelectorAll('.nav-link');
    this.filtBtns        = document.querySelectorAll('.filt-btn');
    this.projCards       = document.querySelectorAll('.proj-card');
    this.statNums        = document.querySelectorAll('.stat-num');
    this.modal           = document.getElementById('doc-modal');
    this.modalImage      = document.getElementById('modal-image');
    this.modalClose      = document.getElementById('modal-close');
    this.modalOverlay    = document.getElementById('modal-overlay');
    this.skipLink        = document.getElementById('skip-link');
    this.scrollToTopBtn   = document.getElementById('scroll-to-top');
    this.scrollProgressBar = document.getElementById('scroll-progress-bar');

    this.searchInput     = document.getElementById('project-search');
    this.searchClear     = document.getElementById('project-search-clear');
    this.emptyState      = document.getElementById('projects-empty-state');
    this.emptyStateReset = document.getElementById('empty-state-reset');
    this.currentCategory = 'all';
    this.currentSearch   = '';

    this.countersStarted = false;
    this.scrollTicking   = false;
    this.projectIndex    = [];

    this.init();
  }

  init() {
    this.buildProjectSearchIndex();
    this.setupScrollPipeline();
    this.setupActiveNavLinkObserver();
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupScrollReveal();
    this.setupProjectFilter();
    this.setupProjectSearch();
    this.setupCalculator();
    this.setupCounters();
    this.setupAccessibility();
    this.setupModal();
    this.setupSkipLink();
    this.setupContactForm();
    this.setupScrollToTop();
    this.setupGalleries();
    this.setupKeyboardDispatcher();
  }

  /* ─────────────────────────────────────────────────────────────────────
     UNIFIED rAF SCROLL PIPELINE (Navbar + Scroll-To-Top in 1 loop)
     ───────────────────────────────────────────────────────────────────── */

  setupScrollPipeline() {
    const updateOnScroll = () => {
      const y = window.scrollY;

      if (this.navbar) {
        if (y > 20) {
          this.navbar.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04)';
          this.navbar.style.backgroundColor = 'rgba(9, 9, 11, 0.98)';
        } else {
          this.navbar.style.boxShadow = 'none';
          this.navbar.style.backgroundColor = 'rgba(9, 9, 11, 0.95)';
        }
      }

      if (this.scrollToTopBtn) {
        this.scrollToTopBtn.classList.toggle('visible', y > 280);
      }

      if (this.scrollProgressBar) {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollTotal > 0 ? Math.min(1, Math.max(0, y / scrollTotal)) : 0;
        const circumference = 125.66;
        this.scrollProgressBar.style.strokeDashoffset = (circumference * (1 - progress)).toFixed(2);
      }

      this.scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!this.scrollTicking) {
        this.scrollTicking = true;
        requestAnimationFrame(updateOnScroll);
      }
    }, { passive: true });

    updateOnScroll();
  }

  /* ─────────────────────────────────────────────────────────────────────
     ACTIVE NAV LINK via IntersectionObserver (Zero Forced Reflow)
     ───────────────────────────────────────────────────────────────────── */

  setupActiveNavLinkObserver() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          this.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }

  /* ─────────────────────────────────────────────────────────────────────
     MOBILE MENU
     ───────────────────────────────────────────────────────────────────── */

  setupMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', () => {
      const isOpen = this.navMenu.getAttribute('aria-expanded') === 'true';
      const willOpen = !isOpen;
      this.navMenu.setAttribute('aria-expanded', String(willOpen));
      this.navToggle.setAttribute('aria-expanded', String(willOpen));
      document.body.classList.toggle('nav-menu-open', willOpen);
    });

    this.navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    document.addEventListener('click', (e) => {
      if (this.navbar && !this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  closeMobileMenu() {
    if (!this.navMenu) return;
    this.navMenu.setAttribute('aria-expanded', 'false');
    if (this.navToggle) this.navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-menu-open');
  }

  /* ─────────────────────────────────────────────────────────────────────
     SMOOTH SCROLL
     ───────────────────────────────────────────────────────────────────── */

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     SCROLL REVEAL
     ───────────────────────────────────────────────────────────────────── */

  setupScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────────────
     PRE-INDEXED PROJECT FILTER & LIVE SEARCH (O(1) Memory Index)
     ───────────────────────────────────────────────────────────────────── */

  buildProjectSearchIndex() {
    this.projectIndex = Array.from(this.projCards).map(card => {
      const cats = (card.dataset.filter || '').split(/\s+/).filter(Boolean);
      const searchText = (card.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return { card, cats, searchText };
    });
  }

  setupProjectFilter() {
    if (!this.filtBtns.length) return;

    this.filtBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filtBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        this.currentCategory = btn.dataset.filter || 'all';
        this.applyProjectFilters();
      });
    });
  }

  setupProjectSearch() {
    if (!this.searchInput) return;

    let searchRaf = null;
    this.searchInput.addEventListener('input', () => {
      if (searchRaf) cancelAnimationFrame(searchRaf);
      searchRaf = requestAnimationFrame(() => {
        this.currentSearch = this.searchInput.value.trim().toLowerCase();
        if (this.searchClear) {
          this.searchClear.style.display = this.currentSearch ? 'inline-block' : 'none';
        }
        this.applyProjectFilters();
      });
    });

    if (this.searchClear) {
      this.searchClear.addEventListener('click', () => {
        this.searchInput.value = '';
        this.currentSearch = '';
        this.searchClear.style.display = 'none';
        this.searchInput.focus();
        this.applyProjectFilters();
      });
    }

    if (this.emptyStateReset) {
      this.emptyStateReset.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = '';
          this.currentSearch = '';
        }
        if (this.searchClear) {
          this.searchClear.style.display = 'none';
        }
        this.filtBtns.forEach(b => {
          const isAll = b.dataset.filter === 'all';
          b.classList.toggle('active', isAll);
          b.setAttribute('aria-selected', String(isAll));
        });
        this.currentCategory = 'all';
        this.applyProjectFilters();
      });
    }
  }

  applyProjectFilters() {
    let visibleCount = 0;
    const filter = this.currentCategory;
    const query = this.currentSearch;

    for (let i = 0; i < this.projectIndex.length; i++) {
      const { card, cats, searchText } = this.projectIndex[i];
      const catMatch = filter === 'all' || cats.includes(filter);
      const searchMatch = !query || searchText.includes(query);
      const show = catMatch && searchMatch;

      if (show) {
        visibleCount++;
        if (card.classList.contains('hidden')) {
          card.classList.remove('hidden');
          card.style.display = '';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }
      } else if (!card.classList.contains('hidden')) {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    }

    if (this.emptyState) {
      this.emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     REACTIVE MVP CALCULATOR (Store + Add-ons + LocalStorage Persistence)
     ───────────────────────────────────────────────────────────────────── */

  setupCalculator() {
    const calcSection = document.getElementById('calculator');
    if (!calcSection) return;

    const defaultConfig = {
      task: 'mvp',
      state: 'idea',
      timeline: 'optimal',
      addons: []
    };

    const store = createReactiveStore(defaultConfig, 'burger_mvp_calc_v2');

    const quickPresets = {
      mvp: {
        task: 'mvp',
        state: 'idea',
        timeline: 'optimal',
        addons: ['uikit', 'analytics']
      },
      landing: {
        task: 'landing',
        state: 'spec',
        timeline: 'fast',
        addons: ['seo', 'motion']
      },
      webgl: {
        task: 'webgl',
        state: 'idea',
        timeline: 'optimal',
        addons: ['motion', 'seo']
      },
      bot: {
        task: 'bot',
        state: 'spec',
        timeline: 'fast',
        addons: ['ai', 'analytics']
      },
      design: {
        task: 'design',
        state: 'idea',
        timeline: 'optimal',
        addons: ['uikit']
      }
    };

    const taskPresets = {
      landing: {
        title: 'Лендинг / Промо-сайт',
        arch: 'Static Edge + Motion UI',
        baseMin: 25000,
        baseMax: 45000,
        complexity: 40,
        cwv: '99 / 100',
        stack: ['HTML5 / CSS Tokens', 'Modern ES6+', 'Motion UI', 'Formspree / Webhooks', 'Lighthouse 98+'],
        steps: [
          'Анализ целевой аудитории и CJM конверсии',
          'Проектирование адаптивного прототипа в Figma',
          'Чистая верстка без тяжелых библиотек',
          'Тестирование скорости на смартфонах и деплой'
        ],
        briefTask: 'конверсионный промо-лендинг'
      },
      mvp: {
        title: 'Веб-сервис / MVP под ключ',
        arch: 'Reactive SPA (Vue 3 / React) + API',
        baseMin: 55000,
        baseMax: 95000,
        complexity: 75,
        cwv: '98 / 100',
        stack: ['Figma', 'Vue 3 / React 18', 'REST API / Supabase', 'State Management', 'Cloudflare'],
        steps: [
          'Проектирование пользовательских сценариев и архитектуры',
          'Дизайн-система компонентов и UI-кит в Figma',
          'Разработка реактивного SPA на Vue 3 / React',
          'Тестирование ключевых путей и передача в продакшен'
        ],
        briefTask: 'веб-сервис / MVP под ключ'
      },
      webgl: {
        title: '3D WebGL / Интерактивный спецпроект',
        arch: 'Three.js + Custom GLSL + 60 FPS',
        baseMin: 65000,
        baseMax: 120000,
        complexity: 85,
        cwv: '95 / 100',
        stack: ['Three.js / WebGL', 'GLSL Shaders', 'InstancedMesh', 'HDR Bloom', 'Vite'],
        steps: [
          'Разработка концепции 3D-сцены, физики и навигации',
          'Оптимизация геометрии, шейдеров и освещения под 60 FPS',
          'Интеграция продуктового UI/HUD поверх 3D-канваса',
          'Кроссбраузерная отладка и бесшовный деплой'
        ],
        briefTask: 'интерактивный 3D WebGL спецпроект на Three.js'
      },
      bot: {
        title: 'Telegram-бот / AI-агент',
        arch: 'Serverless Edge + LLM Pipeline',
        baseMin: 30000,
        baseMax: 60000,
        complexity: 55,
        cwv: '100 / 100',
        stack: ['Cloudflare Workers', 'Telegram Bot API', 'Gemini / OpenAI API', 'TypeScript', '$0 за сервер'],
        steps: [
          'Проектирование диалоговых веток и логики ассистента',
          'Развертывание Serverless-воркера на Cloudflare',
          'Подключение LLM API и системных промптов',
          'Тестирование сценариев в Telegram и запуск'
        ],
        briefTask: 'интеллектуальный Telegram-бот / AI-агент'
      },
      design: {
        title: 'UI/UX & Дизайн-система',
        arch: 'Tokenized Figma System (WCAG AA)',
        baseMin: 35000,
        baseMax: 65000,
        complexity: 50,
        cwv: '100 / 100',
        stack: ['Figma', 'Design Tokens', 'Auto Layout 5.0', 'Interactive Prototype', 'WCAG AA'],
        steps: [
          'UX-исследование потребностей и аудит аналогов',
          'Сетка, типографика и система дизайн-токенов',
          'Библиотека интерактивных компонентов и состояний',
          'Подготовка спецификации и хэндофф для разработки'
        ],
        briefTask: 'UI/UX проектирование и дизайн-система в Figma'
      }
    };

    const addonPresets = {
      ai:        { label: 'AI / LLM-модуль', tag: 'LLM / AI Agent', min: 20000, max: 25000, c: 10 },
      uikit:     { label: 'UI-кит в Figma', tag: 'Figma UI-Kit', min: 15000, max: 20000, c: 8 },
      motion:    { label: '3D / Motion-анимации', tag: 'WebGL / Motion', min: 20000, max: 30000, c: 12 },
      seo:       { label: 'SEO & Скорость 95+', tag: 'Core Web Vitals 95+', min: 10000, max: 15000, c: 5 },
      analytics: { label: 'Аналитика & CRM', tag: 'Analytics & Webhooks', min: 12000, max: 18000, c: 7 }
    };

    const stateDescriptions = {
      idea: 'есть общее видение и идея, нужно спроектировать с нуля',
      spec: 'есть готовое ТЗ / дизайн в Figma, нужна чистая разработка',
      redesign: 'нужен редизайн и ускорение текущего сайта'
    };

    const timelinePresets = {
      fast:     { label: '~1–2 недели (Спринт)', sub: 'приоритетный темп', brief: 'срочно за 1–2 недели' },
      optimal:  { label: '~3–4 недели', sub: 'поэтапные спринты', brief: 'в темпе ~3–4 недели' },
      flexible: { label: 'Сроки гибкие', sub: 'по согласованию', brief: 'сроки гибкие, готов обсудить' }
    };

    // DOM Elements
    const elTitle          = document.getElementById('summary-task-title');
    const elStack          = document.getElementById('summary-stack');
    const elArch           = document.getElementById('summary-arch');
    const elSteps          = document.getElementById('summary-steps');
    const elBrief          = document.getElementById('summary-brief');
    const elTgBtn          = document.getElementById('calc-tg-btn');
    const elCopyBtn        = document.getElementById('calc-copy-btn');
    const elResetBtn       = document.getElementById('calc-reset-btn');
    const addonBtns        = calcSection.querySelectorAll('.calc-addon-btn');
    const presetBtns       = calcSection.querySelectorAll('.calc-preset-chip');

    // Astra HUD Elements
    const elHudPrice       = document.getElementById('hud-price');
    const elHudTimeline    = document.getElementById('hud-timeline');
    const elHudTimelineSub = document.getElementById('hud-timeline-sub');
    const elHudComplexity  = document.getElementById('hud-complexity-val');
    const elHudBar         = document.getElementById('hud-complexity-bar');
    const elHudArch        = document.getElementById('hud-arch-label');
    const elHudSpeed       = document.getElementById('hud-speed');

    // Calculate budget & complexity
    const calculateMetrics = (current) => {
      const task = taskPresets[current.task] || taskPresets.mvp;
      let min = task.baseMin;
      let max = task.baseMax;
      let complexity = task.complexity;

      if (current.state === 'idea') {
        min = Math.round(min * 1.1);
        max = Math.round(max * 1.15);
        complexity += 5;
      } else if (current.state === 'redesign') {
        min = Math.round(min * 0.95);
        max = Math.round(max * 0.95);
      }

      const addons = Array.isArray(current.addons) ? current.addons : [];
      addons.forEach(key => {
        const addon = addonPresets[key];
        if (addon) {
          min += addon.min;
          max += addon.max;
          complexity += addon.c;
        }
      });

      if (current.timeline === 'fast') {
        min = Math.round(min * 1.1);
        max = Math.round(max * 1.12);
        complexity += 4;
      }

      complexity = Math.min(complexity, 98);
      const fmt = (num) => new Intl.NumberFormat('ru-RU').format(Math.round(num / 1000) * 1000);

      return {
        priceStr: `${fmt(min)} – ${fmt(max)} ₽`,
        complexity
      };
    };

    const syncButtonsWithState = (current) => {
      // Step buttons
      calcSection.querySelectorAll('.calc-options-grid, .calc-options-row').forEach(container => {
        const group = container.dataset.group;
        if (!group) return;
        container.querySelectorAll('.calc-opt-btn, .calc-opt-pill').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.value === current[group]);
        });
      });

      // Addons
      const activeAddons = Array.isArray(current.addons) ? current.addons : [];
      addonBtns.forEach(btn => {
        btn.classList.toggle('active', activeAddons.includes(btn.dataset.addon));
      });

      // Presets
      presetBtns.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.preset === current.task);
      });
    };

    // Sub-mockup view updater (Astra interactive tabs)
    const mockViews = calcSection.querySelectorAll('.mock-task-view');
    const updateMockupView = (task) => {
      mockViews.forEach(view => {
        view.style.display = view.id === `mock-view-${task}` ? 'block' : 'none';
      });
    };

    // Subscribe UI to Reactive Store
    store.subscribe((current) => {
      syncButtonsWithState(current);

      const taskData  = taskPresets[current.task] || taskPresets.mvp;
      const timeData  = timelinePresets[current.timeline] || timelinePresets.optimal;
      const stateText = stateDescriptions[current.state] || stateDescriptions.idea;
      const addons    = Array.isArray(current.addons) ? current.addons : [];
      const metrics   = calculateMetrics(current);

      // Update Summary Header & Specs
      if (elTitle) elTitle.textContent = taskData.title;
      if (elArch) elArch.textContent = taskData.arch;

      // Update Astra HUD
      if (elHudPrice) elHudPrice.textContent = metrics.priceStr;
      if (elHudTimeline) elHudTimeline.textContent = timeData.label;
      if (elHudTimelineSub) elHudTimelineSub.textContent = timeData.sub;
      if (elHudComplexity) elHudComplexity.textContent = `${metrics.complexity}%`;
      if (elHudBar) elHudBar.style.width = `${metrics.complexity}%`;
      if (elHudArch) elHudArch.textContent = taskData.arch;
      if (elHudSpeed) elHudSpeed.textContent = taskData.cwv;

      // Update Stack Cloud
      if (elStack) {
        const baseTags = taskData.stack.map(tag => `<span class="summary-stack-tag">${tag}</span>`);
        const extraTags = addons
          .map(key => addonPresets[key])
          .filter(Boolean)
          .map(a => `<span class="summary-stack-tag summary-stack-tag--addon">+ ${a.tag}</span>`);
        elStack.innerHTML = [...baseTags, ...extraTags].join('');
      }

      // Update Sprints List
      if (elSteps) {
        elSteps.innerHTML = taskData.steps
          .map((step, idx) => `<li><strong>Спринт 0${idx + 1}:</strong> ${step}</li>`)
          .join('');
      }

      // Generate brief & telegram message
      const addonLabels = addons
        .map(key => addonPresets[key]?.label)
        .filter(Boolean);
      const addonSentence = addonLabels.length
        ? ` Дополнительно: ${addonLabels.join(', ')}.`
        : '';

      const message = `Привет, Дмитрий! Интересует ${taskData.briefTask}. Исходные данные: ${stateText}, ориентир по срокам: ${timeData.brief}.${addonSentence} Ориентир бюджета: ${metrics.priceStr}. Хочу обсудить реализацию!`;

      if (elBrief) {
        elBrief.textContent = `«${message}»`;
      }

      if (elTgBtn) {
        elTgBtn.href = `https://t.me/aimovl?text=${encodeURIComponent(message)}`;
      }

      // Switch live mockup sandbox
      updateMockupView(current.task);
    });

    // Bind Presets Bar
    presetBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        const presetKey = chip.dataset.preset;
        if (quickPresets[presetKey]) {
          store.setState(quickPresets[presetKey]);
        }
      });
    });

    // Bind Step 1-3 Option Clicks
    calcSection.querySelectorAll('.calc-options-grid, .calc-options-row').forEach(container => {
      const group = container.dataset.group;
      const buttons = container.querySelectorAll('.calc-opt-btn, .calc-opt-pill');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (group && btn.dataset.value) {
            store.setState({ [group]: btn.dataset.value });
          }
        });
      });
    });

    // Bind Step 4 Add-on Module Toggles
    addonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.addon;
        if (!key) return;
        const currentAddons = Array.isArray(store.state.addons) ? [...store.state.addons] : [];
        const idx = currentAddons.indexOf(key);
        if (idx >= 0) {
          currentAddons.splice(idx, 1);
        } else {
          currentAddons.push(key);
        }
        store.setState({ addons: currentAddons });
      });
    });

    // Bind Blueprint Tabs Navigation
    const blueprintTabs = calcSection.querySelectorAll('.blueprint-tab');
    const blueprintPanels = calcSection.querySelectorAll('.blueprint-panel');

    blueprintTabs.forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const targetTab = tabBtn.dataset.tab;
        if (!targetTab) return;

        blueprintTabs.forEach(t => {
          const isActive = t === tabBtn;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        blueprintPanels.forEach(panel => {
          panel.classList.toggle('active', panel.id === `tab-panel-${targetTab}`);
        });
      });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ASTRA-STYLE INTERACTIVE SANDBOX MOCKUP EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    // 1. Dashboard Nav Items & Test Webhook
    const mockNavItems = calcSection.querySelectorAll('.mock-nav-item');
    const mockToast    = document.getElementById('mock-toast-msg');
    const mockVal1     = document.getElementById('mock-mvp-val1');
    const mockVal2     = document.getElementById('mock-mvp-val2');
    const mockBtnWebh  = document.getElementById('mock-btn-webhook');

    mockNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mockNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const action = item.dataset.mockAction;
        if (action === 'tab-users') {
          if (mockVal1) mockVal1.textContent = '1 420 чел.';
          if (mockVal2) mockVal2.textContent = '+18% за неделю';
        } else if (action === 'tab-api') {
          if (mockVal1) mockVal1.textContent = '48.2k запросов';
          if (mockVal2) mockVal2.textContent = '22ms avg';
        } else {
          if (mockVal1) mockVal1.textContent = '248 500 ₽';
          if (mockVal2) mockVal2.textContent = '1 420 чел.';
        }
      });
    });

    if (mockBtnWebh && mockToast) {
      mockBtnWebh.addEventListener('click', () => {
        mockToast.textContent = '✓ Webhook отправлен: 200 OK (21ms)';
        mockToast.style.color = 'var(--color-success)';
        mockBtnWebh.style.transform = 'scale(0.95)';
        setTimeout(() => {
          mockBtnWebh.style.transform = '';
          mockToast.textContent = 'Кликните кнопку для проверки API';
          mockToast.style.color = '';
        }, 2200);
      });
    }

    // 2. Landing Form Submit
    const mockLandingBtn = document.getElementById('mock-landing-btn');
    const mockLandingMsg = document.getElementById('mock-landing-feedback');
    if (mockLandingBtn && mockLandingMsg) {
      mockLandingBtn.addEventListener('click', () => {
        mockLandingMsg.textContent = '✓ Заявка зарегистрирована в CRM (Конверсия: 5.2%)';
        mockLandingBtn.textContent = 'Отправлено!';
        setTimeout(() => {
          mockLandingBtn.textContent = 'Запустить проект';
          mockLandingMsg.textContent = '';
        }, 2500);
      });
    }

    // 3. WebGL 3D Shader Controls
    const mockShaderBtns = calcSection.querySelectorAll('.mock-shader-btn');
    const mock3dCube     = document.getElementById('mock-3d-cube');
    const mockShaderTag  = document.getElementById('mock-active-shader');

    const shaderMap = {
      blue:    { color: '#38bdf8', label: 'Шейдер: Неон-Блю' },
      emerald: { color: '#10b981', label: 'Шейдер: Кибер-Изумруд' },
      violet:  { color: '#a855f7', label: 'Шейдер: Плазма-Вайолет' }
    };

    mockShaderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const shaderKey = btn.dataset.shader;
        const config = shaderMap[shaderKey] || shaderMap.blue;
        mockShaderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (mock3dCube) {
          mock3dCube.style.setProperty('--cube-color', config.color);
        }
        if (mockShaderTag) {
          mockShaderTag.textContent = config.label;
        }
      });
    });

    // 4. Telegram Bot Interactive Simulator
    const mockBotChat    = document.getElementById('mock-bot-chat');
    const mockBotChips   = calcSection.querySelectorAll('.mock-chat-chip');

    const botReplies = {
      vacancies: '🔍 Спарсено 142 вакансии с hh.ru и Habr Freelance! 3 подходящих под стек Vue/React.',
      estimate:  '💰 На основе конфигурации: сметная вилка рассчитана в Blueprint HUD выше. Готов составить КП!',
      ping:      '⚡ Cloudflare Edge: 18ms latency. Uptime 99.99%. Воркер работает без сбоев.'
    };

    mockBotChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.botCmd;
        if (!mockBotChat || !cmd) return;

        const label = chip.querySelector('span')?.textContent || 'Запрос';
        const userMsg = document.createElement('div');
        userMsg.className = 'mock-msg mock-msg--user';
        userMsg.textContent = label;
        mockBotChat.appendChild(userMsg);

        // Typing dot placeholder
        const typingMsg = document.createElement('div');
        typingMsg.className = 'mock-msg mock-msg--bot';
        typingMsg.textContent = 'Astra печатает...';
        mockBotChat.appendChild(typingMsg);
        mockBotChat.scrollTop = mockBotChat.scrollHeight;

        setTimeout(() => {
          typingMsg.textContent = botReplies[cmd] || '✓ Команда успешно выполнена.';
          mockBotChat.scrollTop = mockBotChat.scrollHeight;
        }, 400);
      });
    });

    // 5. Figma Design System Swatches & Toggle
    const mockSwatches = calcSection.querySelectorAll('.mock-swatch');
    mockSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const hex = swatch.dataset.hex;
        if (hex && navigator.clipboard) {
          navigator.clipboard.writeText(hex).then(() => {
            const codeEl = swatch.querySelector('.swatch-code');
            if (codeEl) {
              const orig = codeEl.textContent;
              codeEl.textContent = 'Скопировано!';
              codeEl.style.color = 'var(--color-success)';
              setTimeout(() => {
                codeEl.textContent = orig;
                codeEl.style.color = '';
              }, 1200);
            }
          });
        }
      });
    });

    const mockSwitch = document.getElementById('mock-switch-toggle');
    const mockSwitchStatus = document.getElementById('mock-switch-status');
    if (mockSwitch && mockSwitchStatus) {
      mockSwitch.addEventListener('change', () => {
        mockSwitchStatus.textContent = mockSwitch.checked ? 'Dark Mode ON' : 'Light Mode';
      });
    }

    // Bind Reset Button
    if (elResetBtn) {
      elResetBtn.addEventListener('click', () => {
        store.reset();
      });
    }

    // Bind Copy Button
    if (elCopyBtn) {
      elCopyBtn.addEventListener('click', () => {
        const text = elBrief ? elBrief.textContent.replace(/^«|»$/g, '').trim() : '';
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            const orig = elCopyBtn.innerHTML;
            elCopyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>Скопировано!</span>';
            elCopyBtn.style.color = 'var(--color-success)';
            setTimeout(() => {
              elCopyBtn.innerHTML = orig;
              elCopyBtn.style.color = '';
            }, 2000);
          }).catch(() => {
            prompt('Скопируйте текст сообщения:', text);
          });
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     ANIMATED COUNTERS
     ───────────────────────────────────────────────────────────────────── */

  setupCounters() {
    if (!this.statNums.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.statNums.forEach(el => {
        el.textContent = el.dataset.count;
      });
      return;
    }

    const statsRow = document.querySelector('.stats-row');
    if (!statsRow) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersStarted) {
          this.countersStarted = true;
          this.statNums.forEach(el => this.animateCounter(el));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsRow);
  }

  animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────────────────────────────────────
     ACCESSIBILITY
     ───────────────────────────────────────────────────────────────────── */

  setupAccessibility() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            obs.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     MODAL
     ───────────────────────────────────────────────────────────────────── */

  setupModal() {
    if (!this.modal) return;

    document.querySelectorAll('.modal-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const imageSrc = btn.dataset.modal;
        this.openModal(imageSrc);
      });
    });

    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', () => this.closeModal());
    }
  }

  openModal(imageSrc) {
    if (!this.modal || !this.modalImage) return;
    this.modalImage.src = imageSrc;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────────────────────────────────────────────
     SKIP LINK
     ───────────────────────────────────────────────────────────────────── */

  setupSkipLink() {
    if (!this.skipLink) return;
    this.skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     CONTACT FORM
     ───────────────────────────────────────────────────────────────────── */

  setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');
    if (!form || !statusEl) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          statusEl.textContent = '✓ Спасибо! Ваше сообщение отправлено. Я свяжусь с вами в ближайшее время.';
          statusEl.classList.remove('error');
          statusEl.classList.add('success');
          form.reset();
        } else {
          statusEl.textContent = '✗ Ошибка при отправке. Пожалуйста, попробуйте позже или напишите в Telegram.';
          statusEl.classList.remove('success');
          statusEl.classList.add('error');
        }
      } catch (_) {
        statusEl.textContent = '✗ Ошибка подключения. Пожалуйста, напишите в Telegram.';
        statusEl.classList.remove('success');
        statusEl.classList.add('error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     SCROLL TO TOP BUTTON
     ───────────────────────────────────────────────────────────────────── */

  setupScrollToTop() {
    if (!this.scrollToTopBtn) return;

    this.scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.scrollToTopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     GALLERY MODALS
     ───────────────────────────────────────────────────────────────────── */

  setupGalleries() {
    document.querySelectorAll('.gallery-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const galleryId = btn.dataset.gallery;
        this.openGallery(galleryId);
      });
    });

    document.querySelectorAll('.gallery-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.gallery-modal');
        if (modal) this.closeGalleryModal(modal);
      });
    });

    document.querySelectorAll('.gallery-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        const modal = overlay.closest('.gallery-modal');
        if (modal) this.closeGalleryModal(modal);
      });
    });

    document.querySelectorAll('.gallery-next').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stepGalleryImage(btn, 1);
      });
    });

    document.querySelectorAll('.gallery-prev').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stepGalleryImage(btn, -1);
      });
    });
  }

  closeGalleryModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;

    const slider = gallery.querySelector('.gallery-slider');
    if (slider) {
      slider.style.transform = 'translateX(0)';
    }

    const currentEl = gallery.querySelector('.current');
    if (currentEl) {
      currentEl.textContent = '1';
    }

    const totalEl = gallery.querySelector('.total');
    if (totalEl && slider) {
      const images = slider.querySelectorAll('img');
      totalEl.textContent = images.length;
    }

    gallery.classList.add('active');
    gallery.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  stepGalleryImage(btn, direction) {
    const modal = btn.closest('.gallery-modal');
    if (!modal) return;

    const slider = modal.querySelector('.gallery-slider');
    if (!slider) return;

    const images = slider.querySelectorAll('img');
    if (images.length <= 1) return;

    const currentEl = modal.querySelector('.current');
    const current = parseInt(currentEl.textContent, 10) || 1;
    let next = current + direction;
    if (next > images.length) next = 1;
    if (next < 1) next = images.length;

    const offset = (next - 1) * 100;
    slider.style.transition = 'transform 0.4s cubic-bezier(0.16, 0.84, 0.44, 1)';
    slider.style.transform = `translateX(-${offset}%)`;
    currentEl.textContent = next;
  }

  /* ─────────────────────────────────────────────────────────────────────
     CENTRALIZED KEYBOARD DISPATCHER (Replaces 5 separate listeners)
     ───────────────────────────────────────────────────────────────────── */

  setupKeyboardDispatcher() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K: Quick focus on Project Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        if (this.searchInput) {
          e.preventDefault();
          this.searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          this.searchInput.focus({ preventScroll: true });
        }
        return;
      }

      if (e.key === 'Escape') {
        if (this.modal && this.modal.classList.contains('active')) {
          this.closeModal();
          return;
        }

        const activeGalleries = document.querySelectorAll('.gallery-modal.active');
        if (activeGalleries.length) {
          activeGalleries.forEach(m => this.closeGalleryModal(m));
          return;
        }

        if (this.navMenu && this.navMenu.getAttribute('aria-expanded') === 'true') {
          this.closeMobileMenu();
          if (this.navToggle) this.navToggle.focus();
        }
        return;
      }

      const activeGallery = document.querySelector('.gallery-modal.active');
      if (activeGallery) {
        if (e.key === 'ArrowRight') {
          const nextBtn = activeGallery.querySelector('.gallery-next');
          if (nextBtn) nextBtn.click();
        } else if (e.key === 'ArrowLeft') {
          const prevBtn = activeGallery.querySelector('.gallery-prev');
          if (prevBtn) prevBtn.click();
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Portfolio();
});

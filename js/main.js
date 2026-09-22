/* ═══════════════════════════════════════════════════════════════════════════
   MAIN.JS — Portfolio v2.0
   ═══════════════════════════════════════════════════════════════════════════ */

class Portfolio {
  constructor() {
    this.navbar      = document.querySelector('.navbar');
    this.navToggle   = document.getElementById('navbar-toggle');
    this.navMenu     = document.getElementById('navbar-menu');
    this.navLinks    = document.querySelectorAll('.nav-link');
    this.filtBtns    = document.querySelectorAll('.filt-btn');
    this.projCards   = document.querySelectorAll('.proj-card');
    this.statNums    = document.querySelectorAll('.stat-num');
    this.modal       = document.getElementById('doc-modal');
    this.modalImage  = document.getElementById('modal-image');
    this.modalClose  = document.getElementById('modal-close');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.skipLink    = document.getElementById('skip-link');
    this.scrollToTopBtn = document.getElementById('scroll-to-top');

    this.searchInput     = document.getElementById('project-search');
    this.searchClear     = document.getElementById('project-search-clear');
    this.emptyState      = document.getElementById('projects-empty-state');
    this.emptyStateReset = document.getElementById('empty-state-reset');
    this.currentCategory = 'all';
    this.currentSearch   = '';

    this.countersStarted = false;

    this.init();
  }

  init() {
    this.setupNavbar();
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupScrollReveal();
    this.setupActiveNavLink();
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
  }

  /* ─────────────────────────────────────────────────────────────────────
     NAVBAR — scroll effect
     ───────────────────────────────────────────────────────────────────── */

  setupNavbar() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        this.navbar.style.boxShadow = '0 1px 0 rgba(255,255,255,0.04)';
        this.navbar.style.backgroundColor = 'rgba(9, 9, 11, 0.98)';
      } else {
        this.navbar.style.boxShadow = 'none';
        this.navbar.style.backgroundColor = 'rgba(9, 9, 11, 0.95)';
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────────
     MOBILE MENU
     ───────────────────────────────────────────────────────────────────── */

  setupMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', () => {
      const isOpen = this.navMenu.getAttribute('aria-expanded') === 'true';
      this.navMenu.setAttribute('aria-expanded', String(!isOpen));
      this.navToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on link click
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.navToggle.focus();
      }
    });
  }

  closeMobileMenu() {
    if (!this.navMenu) return;
    this.navMenu.setAttribute('aria-expanded', 'false');
    if (this.navToggle) this.navToggle.setAttribute('aria-expanded', 'false');
  }

  /* ─────────────────────────────────────────────────────────────────────
     SMOOTH SCROLL
     ───────────────────────────────────────────────────────────────────── */

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = target.offsetTop - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     ACTIVE NAV LINK on scroll
     ───────────────────────────────────────────────────────────────────── */

  setupActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');

    const update = () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) {
          current = sec.id;
        }
      });
      this.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─────────────────────────────────────────────────────────────────────
     SCROLL REVEAL
     ───────────────────────────────────────────────────────────────────── */

  setupScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Make all reveal elements visible immediately
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
     PROJECT FILTER & LIVE SEARCH
     ───────────────────────────────────────────────────────────────────── */

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

    this.searchInput.addEventListener('input', () => {
      this.currentSearch = this.searchInput.value.trim().toLowerCase();
      if (this.searchClear) {
        this.searchClear.style.display = this.currentSearch ? 'inline-block' : 'none';
      }
      this.applyProjectFilters();
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
    const search = this.currentSearch;

    this.projCards.forEach(card => {
      const cats = card.dataset.filter || '';
      const text = card.textContent.toLowerCase();
      
      const catMatch = filter === 'all' || cats.includes(filter);
      const searchMatch = !search || text.includes(search);
      const show = catMatch && searchMatch;

      if (show) {
        visibleCount++;
        card.classList.remove('hidden');
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    if (this.emptyState) {
      this.emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     MVP CALCULATOR
     ───────────────────────────────────────────────────────────────────── */

  setupCalculator() {
    const calcSection = document.getElementById('calculator');
    if (!calcSection) return;

    const state = {
      task: 'mvp',
      state: 'idea',
      timeline: 'optimal'
    };

    const taskPresets = {
      landing: {
        title: 'Лендинг / Промо-сайт',
        stack: ['HTML5 / CSS Tokens', 'Modern Vanilla JS', 'Motion UI', 'Formspree / Webhooks', 'Lighthouse 100'],
        steps: [
          'Анализ целевой аудитории и CJM конверсии',
          'Проектирование адаптивного прототипа в Figma',
          'Чистая верстка без раздутых библиотек',
          'Тестирование скорости на смартфонах и деплой'
        ],
        briefTask: 'конверсионный промо-лендинг'
      },
      mvp: {
        title: 'Веб-сервис / MVP под ключ',
        stack: ['Figma', 'Vue 3 / Vite', 'REST API / Supabase', 'Pinia', 'Cloudflare Workers'],
        steps: [
          'Проектирование пользовательских сценариев и архитектуры',
          'Дизайн-система компонентов и UI-кит в Figma',
          'Разработка SPA на Vue 3 с чистым кодом',
          'Тестирование ключевых путей и передача в продакшен'
        ],
        briefTask: 'веб-сервис / MVP под ключ'
      },
      bot: {
        title: 'Telegram-бот / AI-агент',
        stack: ['Cloudflare Workers', 'Telegram Bot API', 'Gemini API', 'TypeScript / Serverless', '$0 за сервер'],
        steps: [
          'Проектирование диалоговых веток и логики ассистента',
          'Развертывание Serverless-воркера на Cloudflare',
          'Подключение Gemini API и системных промптов',
          'Тестирование сценариев в Telegram и запуск'
        ],
        briefTask: 'интеллектуальный Telegram-бот / AI-агент'
      },
      design: {
        title: 'UI/UX & Дизайн-система',
        stack: ['Figma', 'Design Tokens', 'Auto Layout', 'Interactive Prototype', 'WCAG AA'],
        steps: [
          'UX-исследование потребностей и аудит аналогов',
          'Сетка, типографика и система токенов',
          'Библиотека интерактивных компонентов (80+ состояний)',
          'Подготовка спецификации и хэндофф для разработчиков'
        ],
        briefTask: 'UI/UX проектирование и дизайн-система в Figma'
      }
    };

    const stateDescriptions = {
      idea: 'есть общее видение и идея, нужно спроектировать с нуля',
      spec: 'есть готовое ТЗ / дизайн в Figma, нужна чистая разработка',
      redesign: 'нужен редизайн и ускорение текущего сайта'
    };

    const timelinePresets = {
      fast: { label: '~1–2 недели (спринт)', brief: 'срочно за 1–2 недели' },
      optimal: { label: '~3–4 недели', brief: 'в темпе ~3–4 недели' },
      flexible: { label: 'Сроки гибкие', brief: 'сроки гибкие, готов обсудить' }
    };

    const elTitle = document.getElementById('summary-task-title');
    const elStack = document.getElementById('summary-stack');
    const elTimeline = document.getElementById('summary-timeline');
    const elSteps = document.getElementById('summary-steps');
    const elBrief = document.getElementById('summary-brief');
    const elTgBtn = document.getElementById('calc-tg-btn');
    const elCopyBtn = document.getElementById('calc-copy-btn');

    const updateSummary = () => {
      const taskData = taskPresets[state.task] || taskPresets.mvp;
      const timeData = timelinePresets[state.timeline] || timelinePresets.optimal;
      const stateText = stateDescriptions[state.state] || stateDescriptions.idea;

      if (elTitle) elTitle.textContent = taskData.title;

      if (elStack) {
        elStack.innerHTML = taskData.stack
          .map(tag => `<span class="summary-stack-tag">${tag}</span>`)
          .join('');
      }

      if (elTimeline) elTimeline.textContent = timeData.label;

      if (elSteps) {
        elSteps.innerHTML = taskData.steps
          .map(step => `<li>${step}</li>`)
          .join('');
      }

      const message = `Привет, Дмитрий! Интересует ${taskData.briefTask}. Исходные данные: ${stateText}, ориентир по срокам: ${timeData.brief}. Хочу обсудить реализацию!`;

      if (elBrief) {
        elBrief.textContent = `«${message}»`;
      }

      if (elTgBtn) {
        elTgBtn.href = `https://t.me/aimovl?text=${encodeURIComponent(message)}`;
      }
    };

    // Bind Option Clicks
    calcSection.querySelectorAll('.calc-options-grid, .calc-options-row').forEach(container => {
      const group = container.dataset.group;
      const buttons = container.querySelectorAll('.calc-opt-btn, .calc-opt-pill');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (group && btn.dataset.value) {
            state[group] = btn.dataset.value;
            updateSummary();
          }
        });
      });
    });

    // Copy Button Handler
    if (elCopyBtn) {
      elCopyBtn.addEventListener('click', () => {
        const text = elBrief ? elBrief.textContent.replace(/^«|»$/g, '').trim() : '';
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            const orig = elCopyBtn.textContent;
            elCopyBtn.textContent = '✓ Скопировано!';
            elCopyBtn.style.color = 'var(--color-success)';
            setTimeout(() => {
              elCopyBtn.textContent = orig;
              elCopyBtn.style.color = '';
            }, 2000);
          }).catch(() => {
            prompt('Скопируйте текст сообщения:', text);
          });
        }
      });
    }

    // Initial render
    updateSummary();
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
      // Ease out cubic
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
    // Keyboard support for buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Lazy load images
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

    // Open modal on button click
    document.querySelectorAll('.modal-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const imageSrc = btn.dataset.modal;
        this.openModal(imageSrc);
      });
    });

    // Close modal on close button
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    // Close modal on overlay click
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', () => this.closeModal());
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
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
      } catch (error) {
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

    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        this.scrollToTopBtn.classList.add('visible');
      } else {
        this.scrollToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    // Scroll to top on click
    this.scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Keyboard support
    this.scrollToTopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     GALLERY MODALS
     ───────────────────────────────────────────────────────────────────── */

  setupGalleries() {
    // Gallery triggers
    document.querySelectorAll('.gallery-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const galleryId = btn.dataset.gallery;
        this.openGallery(galleryId);
      });
    });

    // Gallery close buttons
    document.querySelectorAll('.gallery-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.gallery-modal');
        if (modal) {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    });

    // Close gallery on overlay click
    document.querySelectorAll('.gallery-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        const modal = overlay.closest('.gallery-modal');
        if (modal) {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    });

    // Close gallery on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.gallery-modal.active').forEach(modal => {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      }
    });

    // Gallery navigation
    document.querySelectorAll('.gallery-next').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextGalleryImage(btn);
      });
    });

    document.querySelectorAll('.gallery-prev').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevGalleryImage(btn);
      });
    });

    // Keyboard navigation in gallery
    document.addEventListener('keydown', (e) => {
      const activeGallery = document.querySelector('.gallery-modal.active');
      if (!activeGallery) return;
      
      if (e.key === 'ArrowRight') {
        const nextBtn = activeGallery.querySelector('.gallery-next');
        if (nextBtn) nextBtn.click();
      } else if (e.key === 'ArrowLeft') {
        const prevBtn = activeGallery.querySelector('.gallery-prev');
        if (prevBtn) prevBtn.click();
      }
    });
  }

  openGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    
    // Reset slider position if exists
    const slider = gallery.querySelector('.gallery-slider');
    if (slider) {
      slider.style.transform = 'translateX(0)';
    }
    
    // Reset counter if exists
    const currentEl = gallery.querySelector('.current');
    if (currentEl) {
      currentEl.textContent = '1';
    }
    
    // Update total if exists
    const totalEl = gallery.querySelector('.total');
    if (totalEl && slider) {
      const images = slider.querySelectorAll('img');
      totalEl.textContent = images.length;
    }
    
    gallery.classList.add('active');
    gallery.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  nextGalleryImage(btn) {
    const modal = btn.closest('.gallery-modal');
    if (!modal) return;
    
    const slider = modal.querySelector('.gallery-slider');
    if (!slider) return;

    const images = slider.querySelectorAll('img');
    if (images.length === 0) return;
    if (images.length === 1) return; // Не листаем если одна картинка

    const currentEl = modal.querySelector('.current');
    let current = parseInt(currentEl.textContent, 10) || 1;
    const next = current >= images.length ? 1 : current + 1;

    // Calculate transform с плавностью
    const offset = (next - 1) * 100;
    slider.style.transition = 'transform 0.4s cubic-bezier(0.16, 0.84, 0.44, 1)';
    slider.style.transform = `translateX(-${offset}%)`;
    currentEl.textContent = next;
  }

  prevGalleryImage(btn) {
    const modal = btn.closest('.gallery-modal');
    if (!modal) return;
    
    const slider = modal.querySelector('.gallery-slider');
    if (!slider) return;

    const images = slider.querySelectorAll('img');
    if (images.length === 0) return;
    if (images.length === 1) return; // Не листаем если одна картинка

    const currentEl = modal.querySelector('.current');
    let current = parseInt(currentEl.textContent, 10) || 1;
    const prev = current === 1 ? images.length : current - 1;

    // Calculate transform с плавностью
    const offset = (prev - 1) * 100;
    slider.style.transition = 'transform 0.4s cubic-bezier(0.16, 0.84, 0.44, 1)';
    slider.style.transform = `translateX(-${offset}%)`;
    currentEl.textContent = prev;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  new Portfolio();
});

/* Screen reader utility */
const srStyle = document.createElement('style');
srStyle.textContent = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`;
document.head.appendChild(srStyle);

/* ═══════════════════════════════════════════════════════════════════════════
   APP.JS — Editorial Portfolio v3 (Theme Switch, Top-Layer Viewer, Search, Brief)
   ═══════════════════════════════════════════════════════════════════════════ */

class EditorialPortfolio {
  constructor() {
    this.dialog = document.getElementById('viewer-dialog');
    this.dialogTitle = document.getElementById('viewer-title');
    this.dialogImg = document.getElementById('viewer-img');
    this.dialogCaption = document.getElementById('viewer-caption');
    this.dialogCounter = document.getElementById('viewer-counter');
    this.dialogPrev = document.getElementById('viewer-prev');
    this.dialogNext = document.getElementById('viewer-next');
    this.dialogClose = document.getElementById('viewer-close');
    this.toastEl = document.getElementById('ed-toast');

    this.galleryItems = [];
    this.galleryIndex = 0;
    this.toastTimer = null;
    this.supportsDisplayTransition = undefined;

    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setupScrollProgressFallback();
    this.setupMobileMenu();
    this.setupActiveNav();
    this.renderFragments();
    this.setupDeviceToggle();
    this.setupCaseFiltersAndSearch();
    this.setupTopLayerDialog();
    this.setupBriefBuilder();
    this.setupCopyButtons();
    this.setupContactForm();
    this.setupKeyboard();
  }

  showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('visible');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('visible');
    }, 2200);
  }

  /* ─── 1. Dark / Light Theme Switcher ──────────────────────────────────── */
  setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const saved = localStorage.getItem('de_portfolio_theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    this.syncThemeButton(btn, saved);

    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('de_portfolio_theme', next);
      this.syncThemeButton(btn, next);
    });
  }

  syncThemeButton(btn, theme) {
    const isLight = theme === 'light';
    btn.setAttribute('aria-label', isLight ? 'Включить тёмную тему' : 'Включить светлую тему');
    btn.innerHTML = isLight
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  }

  /* ─── 2. Scroll Progress Indicator Fallback ───────────────────────────── */
  setupScrollProgressFallback() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    if (window.CSS?.supports?.('animation-timeline', 'scroll()')) return;

    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${pct.toFixed(4)})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ─── 3. Mobile Nav & Active Section Highlight ────────────────────────── */
  setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');
    if (!toggle || !navList) return;

    const close = () => {
      navList.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const open = navList.getAttribute('data-open') === 'true';
      navList.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });

    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navList.contains(e.target)) close();
    });
  }

  setupActiveNav() {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });

    sections.forEach(sec => obs.observe(sec));
  }

  /* ─── 4. Render Fragments Proof Grid ──────────────────────────────────── */
  renderFragments() {
    const grid = document.getElementById('fragments-grid');
    const items = window.PORTFOLIO_DATA?.fragments || [];
    if (!grid || !items.length) return;

    grid.innerHTML = items.map((item, idx) => `
      <button type="button" class="frag-tile" data-frag-idx="${idx}" aria-label="Открыть фрагмент: ${item.title}">
        <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" />
        <span class="frag-cap">${item.title}</span>
      </button>
    `).join('');

    grid.addEventListener('click', (e) => {
      const tile = e.target.closest('[data-frag-idx]');
      if (!tile) return;
      const idx = parseInt(tile.dataset.fragIdx, 10) || 0;
      this.openGallery(items, idx, 'Фрагменты работ');
    });
  }

  /* ─── 4B. Flagship Desktop / Mobile Mockup Switcher ───────────────────── */
  setupDeviceToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.device-toggle-btn[data-device]');
      if (!btn) return;
      const group = btn.closest('.device-toggle');
      const targetId = group?.dataset.target;
      const frame = targetId ? document.getElementById(targetId) : null;
      if (!frame) return;

      const isMobile = btn.dataset.device === 'mobile';
      frame.classList.toggle('is-mobile', isMobile);
      group.querySelectorAll('.device-toggle-btn').forEach(b => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
    });
  }

  /* ─── 5. Case Study Filter & Live Search ──────────────────────────────── */
  setupCaseFiltersAndSearch() {
    const rows = Array.from(document.querySelectorAll('.bento-card, .case-row'));
    const bentoWrap = document.getElementById('bento-showcase');
    const subLabel = document.getElementById('cases-sub-label');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('case-search');
    const emptyEl = document.getElementById('cases-empty');
    if (!rows.length) return;

    const index = rows.map(row => ({
      row,
      isBento: row.classList.contains('bento-card'),
      cats: (row.dataset.cat || '').split(/\s+/).filter(Boolean),
      text: (row.textContent || '').replace(/\s+/g, ' ').toLowerCase()
    }));

    let activeCat = 'all';
    let query = '';

    const apply = () => {
      let visible = 0;
      let visibleBento = 0;
      let visibleRows = 0;
      index.forEach(item => {
        const matchCat = activeCat === 'all' || item.cats.includes(activeCat);
        const matchQuery = !query || item.text.includes(query);
        const show = matchCat && matchQuery;
        item.row.hidden = !show;
        if (show) {
          visible++;
          if (item.isBento) visibleBento++;
          else visibleRows++;
        }
      });
      if (bentoWrap) bentoWrap.hidden = visibleBento === 0;
      if (subLabel) subLabel.hidden = visibleRows === 0 || visibleBento === 0;
      if (emptyEl) emptyEl.hidden = visible > 0;
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeCat = btn.dataset.filter || 'all';
        apply();
      });
    });

    if (searchInput) {
      let raf = null;
      searchInput.addEventListener('input', () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          query = searchInput.value.trim().toLowerCase();
          apply();
        });
      });
    }
  }

  /* ─── 6. Native <dialog> Top-Layer Viewer + Fallbacks ─────────────────── */
  canTransitionDisplay() {
    if (this.supportsDisplayTransition !== undefined) return this.supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) return false;
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    this.supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return this.supportsDisplayTransition;
  }

  supportsTopLayerExit() {
    return window.CSS?.supports?.('overlay', 'auto') && this.canTransitionDisplay();
  }

  async closeTopLayer(el) {
    if (!el || !el.open) return;
    if (!this.supportsTopLayerExit()) {
      el.setAttribute('data-closing', '');
      const anims = el.getAnimations({ subtree: true });
      if (anims.length) {
        await Promise.race([
          Promise.allSettled(anims.map(a => a.finished)),
          new Promise(r => setTimeout(r, 400))
        ]);
      }
      if (!el.hasAttribute('data-closing')) return;
      el.removeAttribute('data-closing');
    }
    el.close();
  }

  setupTopLayerDialog() {
    if (!this.dialog) return;

    this.dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.closeTopLayer(this.dialog);
    });

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const outside = (e) => {
        const box = this.dialog.querySelector('.dialog-surface');
        if (!box) return false;
        const r = box.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      this.dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e); });
      this.dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e)) this.closeTopLayer(this.dialog);
      });
    }

    if (this.dialogClose) {
      this.dialogClose.addEventListener('click', () => this.closeTopLayer(this.dialog));
    }

    if (this.dialogPrev) this.dialogPrev.addEventListener('click', () => this.stepGallery(-1));
    if (this.dialogNext) this.dialogNext.addEventListener('click', () => this.stepGallery(1));

    // Swipe inside modal
    const mediaWrap = this.dialog.querySelector('.dialog-media-wrap');
    if (mediaWrap) {
      let sx = 0, sy = 0;
      mediaWrap.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; }, { passive: true });
      mediaWrap.addEventListener('pointerup', (e) => {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (this.galleryItems.length > 1 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          this.stepGallery(dx < 0 ? 1 : -1);
        }
      }, { passive: true });
    }

    // Delegated gallery & single-image triggers (cases, print gallery & document)
    document.addEventListener('click', (e) => {
      const galBtn = e.target.closest('[data-gallery]');
      if (galBtn) {
        e.preventDefault();
        const key = galBtn.dataset.gallery;
        const list = window.PORTFOLIO_DATA?.galleries?.[key];
        if (list && list.length) {
          const idx = Math.max(0, Math.min(list.length - 1, parseInt(galBtn.dataset.galleryIndex || '0', 10) || 0));
          this.openGallery(list, idx, galBtn.dataset.galleryTitle || 'Галерея работ');
          return;
        }
      }

      const btn = e.target.closest('[data-preview]');
      if (!btn) return;
      e.preventDefault();
      const items = [{
        src: btn.dataset.preview,
        fallback: btn.dataset.previewFallback || '',
        title: btn.dataset.previewTitle || 'Превью'
      }];
      this.openGallery(items, 0, btn.dataset.previewTitle || 'Просмотр');
    });
  }

  openGallery(items, startIndex, heading) {
    if (!this.dialog || !items.length) return;
    this.galleryItems = items;
    this.galleryIndex = startIndex;
    if (this.dialogTitle) this.dialogTitle.textContent = heading;

    const multi = items.length > 1;
    if (this.dialogPrev) this.dialogPrev.hidden = !multi;
    if (this.dialogNext) this.dialogNext.hidden = !multi;
    if (this.dialogCounter) this.dialogCounter.hidden = !multi;

    this.renderSlide();
    this.dialog.removeAttribute('data-closing');
    if (!this.dialog.open) this.dialog.showModal();
  }

  stepGallery(dir) {
    if (this.galleryItems.length <= 1) return;
    this.galleryIndex = (this.galleryIndex + dir + this.galleryItems.length) % this.galleryItems.length;
    this.renderSlide();
  }

  renderSlide() {
    const item = this.galleryItems[this.galleryIndex];
    if (!item || !this.dialogImg) return;
    this.dialogImg.onerror = () => {
      if (item.fallback && this.dialogImg.getAttribute('src') !== item.fallback) {
        this.dialogImg.onerror = null;
        this.dialogImg.src = item.fallback;
      }
    };
    this.dialogImg.src = item.src;
    this.dialogImg.alt = item.title || '';
    if (this.dialogCaption) {
      this.dialogCaption.textContent = item.tag ? `${item.title} · ${item.tag}` : item.title;
    }
    if (this.dialogCounter) {
      this.dialogCounter.textContent = `${this.galleryIndex + 1} / ${this.galleryItems.length}`;
    }
  }

  /* ─── 7. Express Brief Builder -> TG / Form ───────────────────────────── */
  setupBriefBuilder() {
    const chips = document.querySelectorAll('.brief-chip');
    const tgLink = document.getElementById('brief-tg-link');
    const toFormBtn = document.getElementById('brief-to-form');
    const templates = window.PORTFOLIO_DATA?.briefTemplates || {};
    let currentKey = 'mvp';

    const sync = () => {
      const data = templates[currentKey] || templates.mvp;
      if (!data) return;
      if (tgLink) {
        tgLink.href = `https://t.me/aimovl?text=${encodeURIComponent(data.text)}`;
      }
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentKey = chip.dataset.brief || 'mvp';
        sync();
      });
    });

    if (toFormBtn) {
      toFormBtn.addEventListener('click', () => {
        const data = templates[currentKey] || templates.mvp;
        const msgInput = document.getElementById('contact-message');
        const nameInput = document.getElementById('contact-name');
        if (msgInput && data) {
          msgInput.value = data.text;
          msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (nameInput) nameInput.focus();
        this.showToast('Бриф подставлен в форму');
      });
    }

    sync();
  }

  /* ─── 8. Copy Utilities ───────────────────────────────────────────────── */
  setupCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.copy;
        if (val && navigator.clipboard) {
          navigator.clipboard.writeText(val).then(() => {
            this.showToast(btn.dataset.toast || `Скопировано: ${val}`);
          });
        }
      });
    });
  }

  /* ─── 9. Contact Form AJAX ────────────────────────────────────────────── */
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;

    form.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('invalid', () => el.setAttribute('aria-invalid', 'true'));
      el.addEventListener('input', () => {
        if (el.validity.valid) el.removeAttribute('aria-invalid');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        const bad = form.querySelector(':invalid');
        if (bad) bad.focus();
        form.reportValidity();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      try {
        btn.disabled = true;
        btn.textContent = 'Отправка...';
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          status.textContent = '✓ Заявка отправлена. Отвечу в течение 1–2 часов.';
          status.className = 'form-status ok';
          form.reset();
        } else {
          status.textContent = '✗ Не удалось отправить. Напишите напрямую в Telegram @aimovl.';
          status.className = 'form-status err';
        }
      } catch (_) {
        status.textContent = '✗ Ошибка сети. Напишите напрямую в Telegram @aimovl.';
        status.className = 'form-status err';
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }

  /* ─── 10. Global Shortcuts (Ctrl+K Search, Arrows in Dialog) ───────────── */
  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const input = document.getElementById('case-search');
        if (input) {
          e.preventDefault();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          input.focus({ preventScroll: true });
        }
        return;
      }
      if (this.dialog && this.dialog.open) {
        if (e.key === 'ArrowRight') this.stepGallery(1);
        else if (e.key === 'ArrowLeft') this.stepGallery(-1);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new EditorialPortfolio());

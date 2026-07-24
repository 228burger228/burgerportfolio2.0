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
     PROJECT FILTER
     ───────────────────────────────────────────────────────────────────── */

  setupProjectFilter() {
    if (!this.filtBtns.length) return;

    this.filtBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        this.filtBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        this.projCards.forEach(card => {
          const cats = card.dataset.filter || '';
          const show = filter === 'all' || cats.includes(filter);

          if (show) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            card.classList.remove('hidden');
            // Trigger reflow then animate in
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              });
            });
          } else {
            card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(8px)';
            setTimeout(() => {
              if (!card.dataset.filter.includes(filter) && filter !== 'all') {
                card.classList.add('hidden');
              }
            }, 200);
          }
        });
      });
    });
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
        btn.closest('.gallery-modal').classList.remove('active');
        btn.closest('.gallery-modal').setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close gallery on overlay click
    document.querySelectorAll('.gallery-overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        overlay.closest('.gallery-modal').classList.remove('active');
        overlay.closest('.gallery-modal').setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
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

    // Gallery navigation (for graphic-gallery with multiple images)
    document.querySelectorAll('.gallery-next').forEach(btn => {
      btn.addEventListener('click', () => this.nextGalleryImage(btn));
    });

    document.querySelectorAll('.gallery-prev').forEach(btn => {
      btn.addEventListener('click', () => this.prevGalleryImage(btn));
    });
  }

  openGallery(galleryId) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    gallery.classList.add('active');
    gallery.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  nextGalleryImage(btn) {
    const gallery = btn.closest('.gallery-modal');
    const slider = gallery.querySelector('.gallery-slider');
    if (!slider) return;

    const images = slider.querySelectorAll('img');
    const current = parseInt(gallery.querySelector('.current').textContent, 10);
    const next = current % images.length + 1;

    slider.style.transform = `translateX(-${(next - 1) * 100}%)`;
    gallery.querySelector('.current').textContent = next;
  }

  prevGalleryImage(btn) {
    const gallery = btn.closest('.gallery-modal');
    const slider = gallery.querySelector('.gallery-slider');
    if (!slider) return;

    const images = slider.querySelectorAll('img');
    const current = parseInt(gallery.querySelector('.current').textContent, 10);
    const prev = current === 1 ? images.length : current - 1;

    slider.style.transform = `translateX(-${(prev - 1) * 100}%)`;
    gallery.querySelector('.current').textContent = prev;
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

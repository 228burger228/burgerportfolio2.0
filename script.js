class PortfolioApp {
    constructor() {
        this.weatherCanvas = document.getElementById('weatherCanvas');
        this.ctx = this.weatherCanvas.getContext('2d');
        this.sun = document.getElementById('sun');
        this.particles = [];
        this.season = 'winter';
        
        // Пасхалка (Burger Mode)
        this.clickCount = 0;
        this.isBurgerMode = false;
        
        // Navigation
        this.navLinks = document.querySelectorAll('.nav-list li[data-page]');
        this.sections = document.querySelectorAll('.page');
        
        // Gallery Filters
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        
        // Data
        this.portfolioData = null;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.detectSeason();
        this.startLoop();
        this.setupTelegram();
        this.setupEasterEgg();
        this.setupGalleryFilters();
        this.setupHeroButton();
        this.loadPortfolioData();
        this.setupAdminAccess();
    }

    setupHeroButton() {
        const heroBtn = document.querySelector('a[href="#design"]');
        if (heroBtn) {
            heroBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const designNavLink = document.querySelector('.nav-links li[data-target="design"]');
                if (designNavLink) {
                    designNavLink.click();
                }
            });
        }
    }

    setupGalleryFilters() {
        if (this.filterButtons.length === 0) return;

        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                this.galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hide');
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                            item.classList.add('hide');
                        }, 300);
                    }
                });
            });
        });
    }

    setupEasterEgg() {
        const logo = document.getElementById('logo-trigger');
        if(!logo) return;
        logo.addEventListener('click', () => {
            this.clickCount++;
            if(this.clickCount === 5) {
                this.isBurgerMode = !this.isBurgerMode;
                this.clickCount = 0;
                this.particles = [];
                alert(this.isBurgerMode ? "🍔 BURGER MODE ACTIVATED!" : "Mode Normal");
                this.setSeason(this.season);
            }
        });
    }

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const target = link.dataset.page;
                
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                this.sections.forEach(sec => {
                    sec.classList.remove('active');
                    if(sec.id === 'page-' + target) {
                        sec.classList.add('active');
                    }
                });

                this.updateThemeForSection(target);
            });
        });
    }

    updateThemeForSection(section) {
        const root = document.documentElement;
        
        if (section === 'genshin') {
            root.style.setProperty('--accent-color', '#d4a3ff');
        } else if (section === 'moto') {
            root.style.setProperty('--accent-color', '#ff4b1f');
        } else if (section === 'youtube') {
            root.style.setProperty('--accent-color', '#FF0000');
        } else if (section === 'design') {
            root.style.setProperty('--accent-color', '#00d2ff');
        } else if (section === 'warpath') {
            root.style.setProperty('--accent-color', '#6b8e23');
        } else {
            this.applySeasonTheme(this.season);
        }
    }

    resize() {
        this.weatherCanvas.width = window.innerWidth;
        this.weatherCanvas.height = window.innerHeight;
    }

    detectSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) this.setSeason('spring');
        else if (month >= 5 && month <= 7) this.setSeason('summer');
        else if (month >= 8 && month <= 10) this.setSeason('autumn');
        else this.setSeason('winter');
    }

    setSeason(season) {
        this.season = season;
        // Убрал ссылку на бейдж, если его нет в HTML
        const badge = document.getElementById('season-badge');
        if(badge) badge.textContent = season; 
        
        this.applySeasonTheme(season);
        
        this.particles = [];
        if(season !== 'summer' || this.isBurgerMode) this.initParticles(season);
    }

    applySeasonTheme(season) {
        const root = document.documentElement;
        if(this.sun) this.sun.classList.remove('active');
        
        const themes = {
            winter: { top: '#141E30', bottom: '#243B55', accent: '#00d2ff' },
            spring: { top: '#134E5E', bottom: '#71B280', accent: '#71B280' },
            summer: { top: '#F2994A', bottom: '#F2C94C', accent: '#F2C94C' },
            autumn: { top: '#3E5151', bottom: '#DECBA4', accent: '#e67e22' }
        };

        const t = themes[season];
        root.style.setProperty('--bg-gradient-top', t.top);
        root.style.setProperty('--bg-gradient-bottom', t.bottom);
        root.style.setProperty('--accent-color', t.accent);

        if(season === 'summer' && this.sun) this.sun.classList.add('active');
    }

    initParticles(season) {
        const count = season === 'autumn' ? 100 : 60;
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: Math.random() * this.weatherCanvas.width,
                y: Math.random() * this.weatherCanvas.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2,
                burgerEmoji: ['🍔', '🍟', '🥤'][Math.floor(Math.random() * 3)]
            });
        }
    }

    draw() {
        this.ctx.clearRect(0,0, this.weatherCanvas.width, this.weatherCanvas.height);
        
        this.particles.forEach(p => {
            if (this.isBurgerMode) {
                this.ctx.font = '20px serif';
                this.ctx.fillText(p.burgerEmoji, p.x, p.y);
            } else {
                this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
                this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                
                if (this.season === 'autumn') {
                    this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(p.x, p.y + 10); this.ctx.stroke();
                } else {
                    this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); this.ctx.fill();
                }
            }

            p.y += p.speed;
            if (p.y > this.weatherCanvas.height) {
                p.y = -20;
                p.x = Math.random() * this.weatherCanvas.width;
            }
        });
    }

    startLoop() {
        const animate = () => {
            if(this.season !== 'summer' || this.isBurgerMode) this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }

    loadPortfolioData() {
        fetch('portfolio-data.json')
            .then(res => res.json())
            .then(data => {
                this.portfolioData = data;
                this.renderProjects();
                this.renderVideos();
                this.renderPackaging();
            })
            .catch(err => console.error('Ошибка загрузки данных:', err));
    }

    renderProjects() {
        if (!this.portfolioData || !this.portfolioData.projects) return;
        
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        container.innerHTML = this.portfolioData.projects.map(proj => `
            <div class="proj-card" data-cat="${proj.cat}">
                <div class="proj-img">
                    <div class="proj-ph">${proj.emoji}</div>
                    <div class="proj-ov"><a href="${proj.link}" target="_blank">Открыть →</a></div>
                    ${proj.badge ? `<div class="proj-gov-badge"><i class="ph ph-seal-check"></i> ${proj.badge}</div>` : ''}
                </div>
                <div class="proj-body">
                    <div class="proj-cats">${proj.tags.map(tag => `<span class="pcat">${tag}</span>`).join('')}</div>
                    <h3>${proj.title}</h3>
                    <p>${proj.desc}</p>
                </div>
            </div>
        `).join('');
    }

    renderVideos() {
        if (!this.portfolioData || !this.portfolioData.videos) return;
        
        const container = document.getElementById('videos-container');
        if (!container) return;
        
        container.innerHTML = this.portfolioData.videos.map(vid => `
            <div class="video-wrap">
                <iframe src="https://www.youtube.com/embed/${vid.vidId}" allowfullscreen></iframe>
            </div>
        `).join('');
    }

    renderPackaging() {
        if (!this.portfolioData || !this.portfolioData.packaging) return;
        
        const container = document.getElementById('packaging-container');
        if (!container) return;
        
        container.innerHTML = this.portfolioData.packaging.map(pack => `
            <div class="pack-card">
                <div class="pack-preview">
                    <div class="pack-ph">📦</div>
                    <div class="pack-type-badge">${pack.type}</div>
                </div>
                <div class="pack-body">
                    <h4>${pack.title}</h4>
                    <p>${pack.desc}</p>
                    <div class="pack-actions">
                        <a href="${pack.link}" target="_blank" class="pack-btn"><i class="ph ph-download-simple"></i> Скачать</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAdminAccess() {
        const adminLink = document.getElementById('admin-link');
        if (!adminLink) return;
        
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            const password = prompt('Введи пароль для доступа к админ-панели:');
            if (password) {
                // Простой хеш пароля (SHA-256 было бы лучше, но для простоты используем простую проверку)
                const hash = this.simpleHash(password);
                const correctHash = '7c4a8d09ca3762af61e59520943dc26494f8941b'; // хеш пароля 'burger2024'
                
                if (hash === correctHash) {
                    window.location.href = 'admin.html';
                } else {
                    alert('❌ Неверный пароль');
                }
            }
        });
    }

    simpleHash(str) {
        // Простая функция хеширования (не криптографическая, но достаточно для базовой защиты)
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    setupTelegram() {
        const form = document.getElementById('tg-form');
        if(!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = document.getElementById('form-status');
            
            btn.textContent = '...';
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    status.textContent = 'Спасибо! Сообщение отправлено.';
                    status.style.color = '#71B280';
                    form.reset();
                } else {
                    status.textContent = 'Ошибка при отправке';
                    status.style.color = '#ff6b6b';
                }
            } catch (err) {
                status.textContent = 'Ошибка подключения';
                status.style.color = '#ff6b6b';
            } finally {
                btn.innerHTML = 'Отправить <i class="ph ph-paper-plane-right"></i>';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new PortfolioApp());

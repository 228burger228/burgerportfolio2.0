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
        this.navLinks = document.querySelectorAll('.nav-links li');
        this.sections = document.querySelectorAll('.page-section');
        
        // Gallery Filters
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        
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
        this.setupHeroButton(); // <--- ДОБАВИЛ ЭТУ СТРОКУ
    }

    // <--- ДОБАВЬ ЭТОТ НОВЫЙ МЕТОД ПОСЛЕ init()
    setupHeroButton() {
        const heroBtn = document.querySelector('a[href="#design"]');
        if (heroBtn) {
            heroBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Отменяем стандартный переход
                // Имитируем клик по пункту меню "Projects"
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
                // UI update
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter Logic
                const filterValue = button.getAttribute('data-filter');

                this.galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hide');
                        item.style.display = 'block'; // Возвращаем в поток
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none'; // Убираем из потока
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
                const target = link.dataset.target;
                
                // Active class updates
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Show Section
                this.sections.forEach(sec => {
                    sec.classList.remove('active', 'fade-in-up');
                    if(sec.id === target) {
                        sec.classList.add('active');
                        // Trigger reflow for animation restart
                        void sec.offsetWidth; 
                        sec.classList.add('fade-in-up');
                    }
                });

                this.updateThemeForSection(target);
            });
        });
    }

    updateThemeForSection(section) {
        const root = document.documentElement;
        // Сброс цвета при переходе
        if (section === 'genshin') root.style.setProperty('--accent-color', '#d4a3ff'); 
        else if (section === 'moto') root.style.setProperty('--accent-color', '#ff4b1f');
        else if (section === 'youtube') root.style.setProperty('--accent-color', '#FF0000');
        else if (section === 'design') root.style.setProperty('--accent-color', '#00d2ff'); // Цвет для дизайна
        else this.applySeasonTheme(this.season);
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
        const names = { winter: 'Winter Frost', spring: 'Spring Bloom', summer: 'Summer Vibes', autumn: 'Autumn Rain' };
        const badge = document.getElementById('season-badge');
        if(badge) badge.textContent = names[season];
        
        this.applySeasonTheme(season);
        
        this.particles = [];
        if(season !== 'summer' || this.isBurgerMode) this.initParticles(season);
    }

    applySeasonTheme(season) {
        const root = document.documentElement;
        this.sun.classList.remove('active');
        
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

        if(season === 'summer') this.sun.classList.add('active');
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

    setupTelegram() {
        const form = document.getElementById('tg-form');
        if(!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = document.getElementById('form-status');
            
            const name = document.getElementById('tg-name').value;
            const msg = document.getElementById('tg-msg').value;
            
            const BOT_TOKEN = '8467633783:AAHkaNcFFCz6fn8AYEUbIjBXLB8uMLsdKH0'; 
            const CHAT_ID = '1577660217'; 
            
            const text = `🍔 Message from Portfolio:\n👤: ${name}\n💬: ${msg}`;
            
            btn.textContent = '...';
            
            try {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: CHAT_ID, text: text })
                });
                status.textContent = 'Отправлено!';
                status.style.color = '#71B280';
                form.reset();
            } catch (err) {
                status.textContent = 'Ошибка';
                status.style.color = 'red';
            } finally {
                btn.innerHTML = 'Отправить <i class="ph ph-paper-plane-right"></i>';
            }
        });
    }
}

// Запуск всего приложения
document.addEventListener('DOMContentLoaded', () => new PortfolioApp());

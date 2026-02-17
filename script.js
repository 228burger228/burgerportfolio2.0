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
    }

    setupEasterEgg() {
        const logo = document.getElementById('logo-trigger');
        if(!logo) return;
        logo.addEventListener('click', () => {
            this.clickCount++;
            if(this.clickCount === 5) {
                this.isBurgerMode = !this.isBurgerMode;
                this.clickCount = 0;
                this.particles = []; // Сброс частиц
                alert(this.isBurgerMode ? "🍔 BURGER MODE ACTIVATED!" : "Mode Normal");
                this.setSeason(this.season); // Перезапуск частиц
            }
        });
    }

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const target = link.dataset.target;
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                this.sections.forEach(sec => {
                    sec.classList.remove('active', 'fade-in-up');
                    if(sec.id === target) {
                        sec.classList.add('active');
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
        if (section === 'genshin') root.style.setProperty('--accent-color', '#d4a3ff'); 
        else if (section === 'moto') root.style.setProperty('--accent-color', '#ff4b1f');
        else if (section === 'youtube') root.style.setProperty('--accent-color', '#FF0000');
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
        document.getElementById('season-badge').textContent = names[season];
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
                // BURGER RAIN
                this.ctx.font = '20px serif';
                this.ctx.fillText(p.burgerEmoji, p.x, p.y);
            } else {
                // NORMAL WEATHER
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
            // Рисуем, если не лето ИЛИ если включен режим бургеров
            if(this.season !== 'summer' || this.isBurgerMode) this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }

    setupTelegram() {
        const form = document.getElementById('tg-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = document.getElementById('form-status');
            
            const name = document.getElementById('tg-name').value;
            const msg = document.getElementById('tg-msg').value;
            
            // --- НАСТРОЙКИ БОТА ---
            const BOT_TOKEN = '8467633783:AAHkaNcFFCz6fn8AYEUbIjBXLB8uMLsdKH0'; 
            // ⚠️ ВСТАВЬ СВОЙ ID НИЖЕ ⚠️
            const CHAT_ID = '1577660217'; // Например: '123456789'
            
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
                status.textContent = 'Ошибка (проверь Chat ID)';
                status.style.color = 'red';
            } finally {
                btn.innerHTML = 'Отправить <i class="ph ph-paper-plane-right"></i>';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new PortfolioApp());

document.addEventListener('DOMContentLoaded', () => {
    // Ждем, пока прогрузится весь HTML, и только потом ищем кнопки
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length === 0) return; // Защита от ошибок, если на странице нет галереи

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Убираем активный класс у всех
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем нажатой
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                    // Небольшая задержка перед сменой position, чтобы анимация успела начаться
                    setTimeout(() => {
                         item.style.position = 'relative'; 
                         item.style.opacity = '1';
                         item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.classList.add('hide');
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    // Ждем окончания анимации (400мс) перед тем как убрать из потока
                    setTimeout(() => {
                        if(item.classList.contains('hide')) {
                            item.style.position = 'absolute';
                            item.style.top = '0'; // Чтобы не растягивал контейнер
                            item.style.left = '0';
                        }
                    }, 400);
                }
            });
        });
    });
});

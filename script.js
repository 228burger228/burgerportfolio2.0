class PortfolioApp {
    constructor() {
        this.weatherCanvas = document.getElementById('weatherCanvas');
        this.ctx = this.weatherCanvas.getContext('2d');
        this.sun = document.getElementById('sun');
        this.particles = [];
        this.season = 'winter'; // Default
        
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
    }

    /* --- ROUTING SYSTEM --- */
    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const target = link.dataset.target;
                
                // 1. Update Menu
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // 2. Switch Page with Animation
                this.sections.forEach(sec => {
                    sec.classList.remove('active', 'fade-in-up');
                    if(sec.id === target) {
                        sec.classList.add('active');
                        // Trigger reflow for animation restart
                        void sec.offsetWidth; 
                        sec.classList.add('fade-in-up');
                    }
                });

                // 3. Optional: Change Theme Vibes based on section
                this.updateThemeForSection(target);
            });
        });
    }

    updateThemeForSection(section) {
        const root = document.documentElement;
        if (section === 'genshin') {
            root.style.setProperty('--accent-color', '#d4a3ff'); // Electro vibe
        } else if (section === 'moto') {
            root.style.setProperty('--accent-color', '#ff4b1f'); // Aggressive red
        } else {
            // Вернуть цвет погоды
            this.applySeasonTheme(this.season);
        }
    }

    /* --- WEATHER ENGINE (Optimized) --- */
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
        if(season !== 'summer') this.initParticles(season);
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
                size: Math.random() * 2
            });
        }
    }

    draw() {
        this.ctx.clearRect(0,0, this.weatherCanvas.width, this.weatherCanvas.height);
        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        
        this.particles.forEach(p => {
            if (this.season === 'autumn') {
                // Rain
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + 10);
                this.ctx.stroke();
            } else {
                // Snow / Pollen
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                this.ctx.fill();
            }

            p.y += p.speed;
            if (p.y > this.weatherCanvas.height) {
                p.y = -10;
                p.x = Math.random() * this.weatherCanvas.width;
            }
        });
    }

    startLoop() {
        const animate = () => {
            if(this.season !== 'summer') this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /* --- TELEGRAM INTEGRATION --- */
    setupTelegram() {
        const form = document.getElementById('tg-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const status = document.getElementById('form-status');
            
            const name = document.getElementById('tg-name').value;
            const msg = document.getElementById('tg-msg').value;
            
            // ВНИМАНИЕ: В реальном продакшене токен лучше прятать на бэкенде.
            // Для портфолио ок, но знай о рисках.
            const BOT_TOKEN = 'ТВОЙ_ТОКЕН_БОТА'; 
            const CHAT_ID = 'ТВОЙ_CHAT_ID';
            
            const text = `📬 New Message from Portfolio:\n👤: ${name}\n💬: ${msg}`;
            
            btn.textContent = 'Sending...';
            
            try {
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: CHAT_ID, text: text })
                });
                status.textContent = 'Sent successfully!';
                status.style.color = '#71B280';
                form.reset();
            } catch (err) {
                status.textContent = 'Error sending message.';
                status.style.color = 'red';
            } finally {
                btn.innerHTML = 'Отправить <i class="ph ph-paper-plane-right"></i>';
            }
        });
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

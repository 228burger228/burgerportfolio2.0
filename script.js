class WeatherPortfolio {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sun = document.getElementById('sun');
        this.badge = document.getElementById('season-badge');
        
        this.particles = [];
        this.animationId = null;
        this.currentSeason = null;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Автозапуск текущего сезона
        this.autoDetectSeason();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    autoDetectSeason() {
        const month = new Date().getMonth(); // 0 - Январь, 11 - Декабрь
        
        // Логика сезонов (Северное полушарие)
        if (month === 11 || month <= 1) this.setSeason('winter');
        else if (month >= 2 && month <= 4) this.setSeason('spring');
        else if (month >= 5 && month <= 7) this.setSeason('summer');
        else this.setSeason('autumn');
    }

    setSeason(season) {
        if (this.currentSeason === season) return;
        this.currentSeason = season;
        
        // Обновляем текст бейджа
        const seasonNames = {
            'winter': 'Зимний режим ❄️',
            'spring': 'Весенний режим 🌱',
            'summer': 'Летний режим ☀️',
            'autumn': 'Осенний режим 🍂'
        };
        this.badge.textContent = seasonNames[season];

        // Останавливаем предыдущую анимацию
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Применяем стили (CSS Variables)
        this.applyTheme(season);

        // Запускаем эффекты
        if (season === 'winter') this.startSnow();
        else if (season === 'autumn') this.startRain();
        else if (season === 'spring') this.startPetals(); // Опционально: пыльца/лепестки
        else this.stopPrecipitation(); // Летом чисто
    }

    applyTheme(season) {
        const root = document.documentElement;
        this.sun.classList.remove('active');

        switch(season) {
            case 'winter':
                root.style.setProperty('--bg-gradient-top', '#141E30');
                root.style.setProperty('--bg-gradient-bottom', '#243B55');
                root.style.setProperty('--accent-color', '#00d2ff');
                break;
            case 'spring':
                root.style.setProperty('--bg-gradient-top', '#56ab2f');
                root.style.setProperty('--bg-gradient-bottom', '#a8e063');
                root.style.setProperty('--accent-color', '#a8e063');
                this.sun.classList.add('active'); // Весной тоже может быть солнце
                break;
            case 'summer':
                root.style.setProperty('--bg-gradient-top', '#ff9966');
                root.style.setProperty('--bg-gradient-bottom', '#ff5e62');
                root.style.setProperty('--accent-color', '#ffba00');
                this.sun.classList.add('active');
                break;
            case 'autumn':
                root.style.setProperty('--bg-gradient-top', '#3E5151');
                root.style.setProperty('--bg-gradient-bottom', '#DECBA4');
                root.style.setProperty('--accent-color', '#e67e22');
                break;
        }
    }

    // --- Эффекты Canvas ---

    startSnow() {
        const createSnowflake = () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            wind: Math.random() * 0.5 - 0.25
        });

        // Создаем начальные снежинки
        for(let i=0; i<100; i++) this.particles.push(createSnowflake());

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();

            this.particles.forEach((p, index) => {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                
                // Движение
                p.y += p.speed;
                p.x += p.wind;

                // Респаун если улетел вниз
                if (p.y > this.canvas.height) {
                    p.y = -5;
                    p.x = Math.random() * this.canvas.width;
                }
            });

            this.ctx.fill();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    startRain() {
        const createDrop = () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            length: Math.random() * 15 + 10,
            speed: Math.random() * 10 + 10
        });

        for(let i=0; i<150; i++) this.particles.push(createDrop());

        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            this.particles.forEach(p => {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.length);
                
                p.y += p.speed;
                if (p.y > this.canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * this.canvas.width;
                }
            });

            this.ctx.stroke();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    startPetals() {
        // Простая имитация пыльцы/лепестков для весны
        const createPetal = () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 1,
            speedY: Math.random() * 1 + 0.2,
            speedX: Math.random() * 2 - 1
        });
         for(let i=0; i<50; i++) this.particles.push(createPetal());
         
         const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            
            this.particles.forEach(p => {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                p.y += p.speedY;
                p.x += p.speedX;
                
                 if (p.y > this.canvas.height) {
                    p.y = -5;
                    p.x = Math.random() * this.canvas.width;
                }
            });
            this.ctx.fill();
            this.animationId = requestAnimationFrame(animate);
         }
         animate();
    }

    stopPrecipitation() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Инициализация
const weatherApp = new WeatherPortfolio();

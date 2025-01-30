// characterAttackSystem.js

// Основной класс для управления боевой системой персонажа
import NicknameSystem from "./nicknameSystem.js";

export class characterAttackSystem {
    constructor(playerNickname) {
        this.nickname = playerNickname; // Никнейм игрока для работы с localStorage
        this.playerStats = this.loadPlayerStats(); // Загрузка данных персонажа из localStorage

        // Элементы интерфейса
        this.attackButton = document.getElementById('attack-button'); // Кнопка обычной атаки
        this.autoAttackToggle = document.getElementById('auto-attack-toggle'); // Переключатель автоматической атаки
        this.skillButtons = [
            document.getElementById('skill-1'),
            document.getElementById('skill-2'),
            document.getElementById('skill-3'),
        ];

        // Лог атаки персонажа
        this.playerAttackLog = document.getElementById("player-attack-log");

        // Флаги автоматического режима
        this.autoAttackEnabled = false;

        // Слушатели событий для кнопок
        this.setupEventListeners();

        // Навыки персонажа
        this.skills = this.initializeSkills();

        // Глобальные переменные состояния
        window.isPlayerAlive = true;
        window.isMobAlive = true;

        // Таймер для автоатаки
        this.autoAttackInterval = null;
    }

    // Загрузка характеристик персонажа из localStorage
    loadPlayerStats() {
        const playerData = NicknameSystem.getPlayerData(this.nickname);
        return playerData ? playerData : this.defaultPlayerStats();
    }

    // Стандартные характеристики персонажа
    defaultPlayerStats() {
        return {
            health: 100,
            maxHealth: 100,
            attackPower: 20,
            strength: 0, // Добавляем силу
            mana: 50,
            stamina: 50,
            attackSpeed: 1.0,
            defense: 0,
        };
    }

    // Настройка событий для интерфейса
    setupEventListeners() {
        // Обычная атака
        this.attackButton?.addEventListener('click', () => this.performAttack());

        // Находим чекбокс внутри кнопки
        const checkbox = this.autoAttackToggle.querySelector('#auto-attack-checkbox');

        // При клике на кнопку переключаем чекбокс (и срабатывает change)
        this.autoAttackToggle.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Автоматический бой
        checkbox.addEventListener('change', (e) => {
            this.autoAttackEnabled = e.target.checked;
            console.log(`Auto attack mode: ${this.autoAttackEnabled ? 'ON' : 'OFF'}`);
            this.toggleAutoAttack();

		    this.autoAttackToggle.classList.toggle('active', this.autoAttackEnabled);	
        });

        // Навыки
        this.skillButtons.forEach((button, index) => {
            button?.addEventListener('click', () => this.useSkill(index));
        });
    }

    // Инициализация навыков
    initializeSkills() {
        return [
            {
                id: 1,
                name: 'Power Strike',
                cooldown: 5,
                lastUsed: 0,
                effect: () => console.log('Power Strike activated!'),
            },
            {
                id: 2,
                name: 'Healing Light',
                cooldown: 10,
                lastUsed: 0,
                effect: () => console.log('Healing Light activated!'),
            },
            {
                id: 3,
                name: 'Shield Bash',
                cooldown: 8,
                lastUsed: 0,
                effect: () => console.log('Shield Bash activated!'),
            },
        ];
    }
	
    // Лог атаки персонажа
    logPlayerAttack(damage) {
		console.log(`Лог атаки вызван: вы нанесли ${damage} урона!`);
        const playerAttackLog = document.getElementById("player-attack-log");

        if (!playerAttackLog ) {
            console.warn("Player attack log element not found!");
            return;
        }

        // Создаём отдельный элемент для урона
        const damageText = document.createElement("div");
        damageText.textContent = `Вы нанесли ${damage} урона!`;
        damageText.classList.add("player-damage-log");

        // Добавляем новый элемент в контейнер лога
        playerAttackLog.appendChild(damageText);

        // Удаляем сообщение через 600 мс
        setTimeout(() => {
            if (damageText.parentElement) {
                damageText.remove();
            }
        }, 600);
    }

    // Обычная атака
    performAttack() {
        if (!window.isMobAlive || !window.isPlayerAlive) return;
			
        const mobHealthBar = document.querySelector('.mob-health-fill');
        if (mobHealthBar) {
            let currentHealth = parseFloat(mobHealthBar.style.width) || 100; // Текущая ширина полосы
			const damage = this.playerStats.attackPower + (this.playerStats.strength * 5); // Учитываем силу
            currentHealth = Math.max(currentHealth - damage, 0);
            mobHealthBar.style.width = `${currentHealth}%`;

            console.log(`Mob health: ${currentHealth}%`);
			
			// Лог атаки
			console.log(`Mob health: ${currentHealth}%`);
            this.logPlayerAttack(damage);

            // Если моб мертв
            if (currentHealth <= 0) {
                window.isMobAlive = false;
                console.log('Mob defeated!');
            }
        }
    }

    // Использование навыка
    useSkill(skillIndex) {
        if (!window.isMobAlive || !window.isPlayerAlive) return;

        const skill = this.skills[skillIndex];
        const currentTime = Date.now() / 1000;

        if (currentTime - skill.lastUsed >= skill.cooldown) {
            skill.lastUsed = currentTime;
            skill.effect();
        } else {
            this.displayAttackLog(`${skill.name} is on cooldown!`);
        }
    }

    // Автоматическое использование навыков
    autoUseSkills() {
        const currentTime = Date.now() / 1000;

        this.skills.forEach((skill) => {
            if (currentTime - skill.lastUsed >= skill.cooldown) {
                skill.lastUsed = currentTime;
                skill.effect();
            }
        });
    }

    // Включение/выключение автоматической атаки
    toggleAutoAttack() {
        if (this.autoAttackEnabled) {
            const attackInterval = 1000 / this.playerStats.attackSpeed; // Чем выше attackSpeed, тем короче задержка
            this.autoAttackInterval = setInterval(() => {
                if (window.isMobAlive && window.isPlayerAlive) {
                    this.performAttack();
                    this.autoUseSkills();
                } else {
                    this.toggleAutoAttack(); // Остановить, если бой завершен
                }
            }, attackInterval); // Используем динамический интервал
        } else {
            clearInterval(this.autoAttackInterval);
            this.autoAttackInterval = null;
        }
    }
}
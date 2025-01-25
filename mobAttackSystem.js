// mobAttackSystem.js

import NicknameSystem from "./nicknameSystem.js";

document.addEventListener("DOMContentLoaded", () => {
    const currentNickname = localStorage.getItem("currentNickname");

    if (!currentNickname || !NicknameSystem.doesNicknameExist(currentNickname)) {
        console.error("Никнейм не найден или игрок не зарегистрирован!");
        return;
    }

    const playerData = NicknameSystem.getPlayerData(currentNickname);

    if (!playerData) {
        console.error("Не удалось загрузить данные игрока.");
        return;
    }

    // Инициализация базовых данных игрока
    let { health, maxHealth, level } = playerData;

    // Конфигурации мобов
    const mobs = {
        goblin: {
            maxLevel: 20,
            baseDamage: 5,
            attackInterval: 2000,
            healthMultiplier: 100,
        },
        skeleton: {
            maxLevel: 40,
            baseDamage: 10,
            attackInterval: 1500,
            healthMultiplier: 120,
        },
		guardianwarrior: {
            maxLevel: 60,
            baseDamage: 20,
            attackInterval: 1000,
            healthMultiplier: 140,
        },
        // Здесь можно добавлять новых мобов
    };

    // Определение активного моба
    let mobId = null;
    for (const mobKey in mobs) {
        if (document.getElementById(mobKey)) {
            mobId = mobKey;
            break;
        }
    }

    if (!mobId) {
        console.error("Активный моб не найден на этой странице!");
        return;
    }

    const activeMob = mobs[mobId];
    let mobLevel = Math.min(level, activeMob.maxLevel);
    let mobDamage = calculateMobDamage(mobLevel, activeMob.baseDamage);

    // Здоровье моба
    let mobMaxHealth = activeMob.healthMultiplier * mobLevel;
    let mobCurrentHealth = mobMaxHealth;

    // Элементы UI
    const playerHealthText = document.getElementById("health-text");
    const mobHealthBar = document.getElementById(`${mobId}-health-fill`);
    const mobAttackLog = document.getElementById("mob-attack-log");

    if (!playerHealthText || !mobHealthBar || !mobAttackLog) {
        console.error("Элементы интерфейса для боя не найдены!");
        return;
    }

    // Функция расчёта урона моба
    function calculateMobDamage(level, baseDamage) {
        return baseDamage + level * 2; // Пример формулы урона
    }

    // Функция обновления здоровья игрока
    function updatePlayerHealth(damage) {
        health = Math.max(health - damage, 0);
        NicknameSystem.updatePlayerData(currentNickname, { health }); // Сохранение данных игрока
        playerHealthText.textContent = `${health} / ${maxHealth}`;

        // Лог атаки моба
        const damageText = document.createElement("div");
        damageText.textContent = `${mobId.toUpperCase()} нанёс ${damage} урона!`;
        damageText.classList.add("damage-log");
        mobAttackLog.appendChild(damageText);

        setTimeout(() => damageText.remove(), 2000);

        // Проверка смерти игрока
        if (health <= 0) {
            clearInterval(attackIntervalId);
            showDeathScreen(); // Отображение экрана смерти
        }
    }    
    
	// Функция отображения экрана смерти
    function showDeathScreen() {
        // Создаём сообщение
        const message = document.createElement("div");        
        message.style.position = "fixed";
        message.style.top = "35%";
        message.style.left = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.width = "500px";
        message.style.height = "500px";
        message.style.background = "url('./assets/notification_plate_nohealth.png') no-repeat center center";
        message.style.backgroundSize = "cover";
        message.style.zIndex = "9999";
        message.style.display = "flex";
        message.style.flexDirection = "column";
        message.style.alignItems = "center";
        message.style.justifyContent = "center";
        message.style.color = "white";
        message.style.fontWeight = "bold";
        message.style.fontSize = "25px";
        message.style.textAlign = "center";
        message.style.paddingTop = "120px";

        // Добавляем сообщение на страницу
        document.body.appendChild(message);

        // Убираем сообщение и перенаправляем на главную через 3 секунды
        setTimeout(() => {
            message.remove(); // Удаляем сообщение
            window.location.href = "game.html"; // Перенаправляем на главную страницу
        }, 3000); // Задержка в 3 секунды
    }

    // Таймер атак моба
    const attackIntervalId = setInterval(() => {
        updatePlayerHealth(mobDamage);
    }, activeMob.attackInterval);

    // Инициализация UI
    playerHealthText.textContent = `${health} / ${maxHealth}`;
    mobHealthBar.style.width = "100%"; // Устанавливаем полное здоровье моба при старте
});

export default MobAttackSystem;
// nicknameSystem.js

// import { initializeMobAttackSystem } from "./mobAttackSystem.js";

import { getExperienceInfo, gainExpFromMob } from './experienceSystem.js';

import itemModule from './items.js';

import { characterAttackSystem } from './characterAttackSystem.js';

// Деструктурируем необходимые элементы из itemModule
const { getItemById, getItemsByType, getItemPrice, items } = itemModule;

//import MobAttackSystem from './mobAttackSystem.js';

window.isPlayerAlive = true;  // Игрок жив при начале боя

// Объект для работы с системой никнеймов
const NicknameSystem = (() => {
    const STORAGE_KEY = "playersData";

    // Загрузка всех данных о игроках из localStorage
    const loadPlayersData = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (error) {
            console.error("Ошибка загрузки данных игроков:", error);
            return {};
        }
    };

    // Сохранение всех данных о игроках в localStorage
    const savePlayersData = (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Ошибка сохранения данных игроков:", error);
        }
    };

    // Проверка существования никнейма
    const doesNicknameExist = (nickname) => {
        const playersData = loadPlayersData();
        return Object.prototype.hasOwnProperty.call(playersData, nickname);
    };

    // Создание или загрузка игрока
    const createOrLoadPlayer = (nickname) => {
        const playersData = loadPlayersData();
        if (!doesNicknameExist(nickname)) {
            playersData[nickname] = {
                score: 0,
                level: 1,
                inventory: [],
                coins: 1000,
                health: 100,
                maxHealth: 100,
                energy: 100,
                maxEnergy: 100,
                attackPower: 10,
            };
            savePlayersData(playersData);
        }
        return playersData[nickname];
    };

    // Получение данных игрока
    const getPlayerData = (nickname) => {
        const playersData = loadPlayersData();
        return playersData[nickname] || null;
    };

    // Обновление данных игрока
    const updatePlayerData = (nickname, newData) => {
        const playersData = loadPlayersData();
        if (doesNicknameExist(nickname)) {
            playersData[nickname] = { ...playersData[nickname], ...newData };
            savePlayersData(playersData);
            return true;
        }
        console.warn(`Игрок с никнеймом "${nickname}" не найден.`);
        return false;
    };

    // Получение инвентаря игрока
    const getInventory = (nickname) => {
        const playerData = getPlayerData(nickname);
        return playerData ? playerData.inventory : null;
    };

    // Обновление инвентаря игрока
    const updateInventory = (nickname, newInventory) => {
        const playersData = loadPlayersData();
        if (doesNicknameExist(nickname)) {
            playersData[nickname].inventory = newInventory;
            savePlayersData(playersData);
            return true;
        }
        console.warn(`Игрок с никнеймом "${nickname}" не найден для обновления инвентаря.`);
        return false;
    };

    return {
        doesNicknameExist,
        createOrLoadPlayer,
        getPlayerData,
        updatePlayerData,
        getInventory,
        updateInventory,
    };
})();

// Боевая страница
import { addToInventory } from './inventory.js';

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
    let { coins, level, health, maxHealth, energy, maxEnergy, attackPower } = playerData;

    // Инициализация данных гоблина
    const goblinMaxLevel = 20; // Максимальный уровень гоблина
    let goblinLevel = Math.min(level, goblinMaxLevel); // Ограничение уровня гоблина
    const goblinBaseHealth = 100; // Базовое здоровье гоблина
    let goblinMaxHealth = goblinBaseHealth * goblinLevel;
    let goblinHealth = goblinMaxHealth;

    // Элементы интерфейса
    const goblinHealthBar = document.getElementById("goblin-health-fill");
    const attackButton = document.getElementById("attack-button");
    const coinsElement = document.getElementById("coins");
    const levelElement = document.getElementById("level");
    const healthText = document.getElementById("health-text");
    const energyText = document.getElementById("energy-text");
    const energyBarFull = document.getElementById("energy-bar");

    // Функция обновления UI игрока
    function updatePlayerUI() {
        coinsElement.textContent = coins;
        levelElement.textContent = level;
        healthText.textContent = `${health} / ${maxHealth}`;
        energyText.textContent = `${energy} / ${maxEnergy}`;
        energyBarFull.style.clipPath = `inset(0 0 0 ${100 - (energy / maxEnergy) * 100}%)`;
    }

    // Функция обновления UI гоблина
    function updateGoblinUI() {
        goblinHealthBar.style.width = `${(goblinHealth / goblinMaxHealth) * 100}%`;
    }
    
	const attackSystem = new characterAttackSystem(currentNickname);

    // Настройка событий для взаимодействия игрока
    attackSystem.attackButton = document.getElementById('attack-button'); // Кнопка атаки
    attackSystem.autoAttackToggle = document.getElementById('auto-attack-toggle'); // Тоггл автoбоя
    attackSystem.skillButtons = [
        document.getElementById('skill-1'), // Кнопка для первого навыка
        document.getElementById('skill-2'), // Кнопка для второго навыка
        document.getElementById('skill-3'), // Кнопка для третьего навыка
    ];

    // Синхронизация начальных данных
    attackSystem.playerStats.health = health;
    attackSystem.playerStats.maxHealth = maxHealth;
    attackSystem.playerStats.attackPower = attackPower;

    // Логика для управления гоблином
    window.isMobAlive = true;
    function updateGoblinHealth(damage) {
        goblinHealth -= damage;
        if (goblinHealth <= 0) {
            goblinHealth = 0;
            window.isMobAlive = false;
            updateGoblinUI();

            gainExpFromMob(currentNickname, 'goblin');
            const reward = calculateReward();
            const lootItem = calculateLoot();
            showVictoryMessage(reward, lootItem);
        } else {
            updateGoblinUI();
        }
    }

    // Привязка обработки атак к системе
    attackSystem.performAttack = function () {
        if (!window.isMobAlive || !window.isPlayerAlive) return;
        console.log('Игрок наносит удар гоблину!');
        updateGoblinHealth(attackSystem.playerStats.attackPower);
		
        // Добавляем сообщение об уроне в лог
        const playerAttackLog = document.getElementById("player-attack-log");
        if (playerAttackLog) {
            const damageText = document.createElement("div");
            damageText.textContent = `Вы нанесли ${attackSystem.playerStats.attackPower} урона!`;
            damageText.classList.add("damage-log");
            playerAttackLog.appendChild(damageText);

            // Удаляем сообщение через 2 секунды
            setTimeout(() => {
                if (damageText.parentElement) {
                    damageText.remove();
                }
            }, 2000);
        }
    };

	
    // Функция расчета награды за победу
    function calculateReward() {
        if (goblinLevel === goblinMaxLevel) {
            return Math.floor(Math.random() * (150 - 100 + 1)) + 100; // Награда за уровень 20: 100-150
        }
        let baseReward = 50;
        let bonusPer10Levels = Math.floor(goblinLevel / 10) * 10;
        let minReward = baseReward + bonusPer10Levels;
        let maxReward = minReward + 50; // Диапазон награды
        return Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    }

    // Функция расчета выпадения лута
    function calculateLoot() {
        const lootChance = Math.random();
        if (lootChance < 0.7) { // Шанс выпадения 70%
            const lootItemId = 103; // ID выпадающего предмета (Глаз гоблина)
            const lootItem = { id: lootItemId, count: 1 }; // Указываем ID и количество
        
            const itemDetails = getItemById(lootItemId); // Получаем данные о предмете
            if (itemDetails) {
                addToInventory([lootItem]); // Передаём в инвентарь
                console.log(`Выпал лут: ${itemDetails.name} (x${lootItem.count})`);
                return lootItem;
            } else {
                console.error("Ошибка: Предмет с таким ID не найден.");
            }
        }
        console.log("Лут не выпал."); // Отладочная информация
        return null;
    }

    // Функция отображения сообщения о победе
    function showVictoryMessage(reward, lootItem = null) {
        const message = document.createElement("div");
        message.style.position = "fixed";
        message.style.top = "35%";
        message.style.left = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.width = "500px";
        message.style.height = "500px";
        message.style.background = "url('./assets/notification_plate_fight.png') no-repeat center center";
        message.style.backgroundSize = "cover";
        message.style.zIndex = "9999";
        message.style.display = "flex";
        message.style.flexDirection = "column";
        message.style.alignItems = "center";
        message.style.justifyContent = "center";
        message.style.color = "white";
        message.style.fontWeight = "bold";
        message.style.fontSize = "30px";
        message.style.textAlign = "center";
        message.style.paddingTop = "120px";

        // Награда
        const rewardText = document.createElement("div");
        rewardText.textContent = `Награда: ${reward} монет.`;
        message.appendChild(rewardText);

        // Лут
        if (lootItem && lootItem.count) {
            const itemDetails = getItemById(lootItem.id); // Получаем имя предмета
            if (itemDetails) {
                const lootText = document.createElement("div");
                lootText.style.marginTop = "20px";
                lootText.textContent = `Выпал: ${itemDetails.name} (x${lootItem.count}).`;
                message.appendChild(lootText);
            }
        }

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
            coins += reward;
            NicknameSystem.updatePlayerData(currentNickname, { coins });
            navigateToGame();
        }, 2000);
    }
	
    document.getElementById('attack-button').addEventListener('click', () => {
        attackSystem.performAttack();
    });

	
    // Инициализация
    goblinMaxHealth = goblinBaseHealth * goblinLevel;
    goblinHealth = goblinMaxHealth;
    updatePlayerUI();
    updateGoblinUI();

    function navigateToGame() {
        window.location.href = "game.html";
    }
});

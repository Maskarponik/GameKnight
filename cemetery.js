// nicknameSystem.js

// import { initializeMobAttackSystem } from "./mobAttackSystem.js";

import { getExperienceInfo, gainExpFromMob } from './experienceSystem.js';

import itemModule from './items.js';

// Деструктурируем необходимые элементы из itemModule
const { getItemById, getItemsByType, getItemPrice, items } = itemModule;

//import MobAttackSystem from './mobAttackSystem.js';

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

    // Инициализация данных Скелета
    const SkeletonMaxLevel = 40; // Максимальный уровень скелета
    let SkeletonLevel = Math.min(level, SkeletonMaxLevel); // Ограничение уровня скелета
    const SkeletonBaseHealth = 200; // Базовое здоровье скелета
    let SkeletonMaxHealth = SkeletonBaseHealth * SkeletonLevel;
    let SkeletonHealth = SkeletonMaxHealth;

    // Элементы интерфейса
    const SkeletonHealthBar = document.getElementById("skeleton-health-fill");
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

    // Функция обновления UI Скелета
    function updateSkeletonUI() {
	  const SkeletonHealthBar = document.getElementById("skeleton-health-fill");
      if (!SkeletonHealthBar) {
        console.error("SkeletonHealthBar is missing!");
        return;
      }
      SkeletonHealthBar.style.width = `${(SkeletonHealth / SkeletonMaxHealth) * 100}%`;
    }

    // Функция расчета награды за победу
    function calculateReward() {
        const baseReward = 100; // Начальная награда
        const bonusPer10Levels = Math.floor(SkeletonLevel / 10) * 20; // Бонус за каждые 10 уровней
        const minReward = baseReward + bonusPer10Levels;
        const maxReward = minReward + 70; // Диапазон награды
        return Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    }

    // Функция расчета выпадения лута
    function calculateLoot() {
        const lootChance = Math.random();
        if (lootChance < 0.5) { // Шанс выпадения 50%
            const lootItemId = 102; // ID выпадающего предмета (Кости)
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
        message.style.background = "url('./assets/notification_plate_skeleton.png') no-repeat center center";
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

    // Обработка атаки
    attackButton.addEventListener("click", () => {
        if (SkeletonHealth > 0) {            
			SkeletonHealth -= attackPower;
            updateSkeletonUI();
			
			// Лог атаки персонажа
            const playerAttackLog = document.getElementById("player-attack-log");
			
			// Создаём отдельный элемент для урона
            const damageText = document.createElement("div");
            damageText.textContent = `Вы нанесли ${attackPower} урона!`;
            damageText.classList.add("damage-log");

            // Добавляем новый элемент в контейнер лога
            playerAttackLog.appendChild(damageText);
			
			// Удаляем сообщение через 2 секунды
            setTimeout(() => {
                if (damageText.parentElement) {
                    damageText.remove();
                }
            }, 600);
			
            if (SkeletonHealth <= 0) {
                SkeletonHealth = 0;
                updateSkeletonUI();
				
				// Начисление опыта за победу над гоблином
                gainExpFromMob(currentNickname, "skeleton");
				
                const reward = calculateReward();
                const lootItem = calculateLoot();
                console.log("Передано в showVictoryMessage:", { reward, lootItem }); // Отладка
                showVictoryMessage(reward, lootItem);
            }
        }
    });

    // Инициализация
    SkeletonMaxHealth = SkeletonBaseHealth * SkeletonLevel;
    SkeletonHealth = SkeletonMaxHealth;
    updatePlayerUI();
    updateSkeletonUI();

    function navigateToGame() {
        window.location.href = "game.html";
    }
	
	    // Настройка моба
    const mobConfig = {
        id: "skeleton", // ID моба, соответствующий HTML-элементуs
        maxLevel: 40, // Максимальный уровень моба
        baseDamage: 10, // Базовый урон
        attackInterval: 2000, // Интервал атаки в мс
        healthMultiplier: 100, // Множитель здоровья
    };

    // Отображаем моба на экране
    const mobElement = document.getElementById(mobConfig.id);
    if (mobElement) {
        mobElement.style.display = "block";
    } else {
        console.error("Элемент моба не найден!");
        return;
    }

    // Запуск системы урона
    initializeMobAttackSystem(mobConfig); // Передаём параметры моба
});

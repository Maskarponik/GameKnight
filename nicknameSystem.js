// nicknameSystem.js

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
			console.log("Сохраняемые данные игроков:", data);
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
    
	const validatePlayerData = (playerData) => {
        if (!playerData.health) playerData.health = 100;
        if (!playerData.maxHealth) playerData.maxHealth = 100;
        if (!playerData.level) playerData.level = 1;
		if (!playerData.experience) playerData.experience = 0; // Проверка поля опыта
        if (!playerData.inventory) playerData.inventory = [];
        return playerData;
    };
	
    // Создание или загрузка игрока
    const createOrLoadPlayer = (nickname) => {
        const playersData = loadPlayersData();
        if (!doesNicknameExist(nickname)) {
            playersData[nickname] = {
                coins: 1000,
                level: 1,
				experience: 0,  // Новое поле опыта
                inventory: [],
                health: 100, // Начальное здоровье
                maxHealth: 100, // Максимальное здоровье
                energy: 100, // Начальное здоровье
                maxEnergy: 100, // Максимальное здоровье
				strength: 10,    // Сила
                attackPower: 20,
				attackSpeed: 1.0,  // Скорость атаки (чем меньше, тем быстрее удары)
                criticalChance: 5, // 5% шанс крита
                criticalMultiplier: 2.0, // Критический урон x2
                defense: 5, // Уменьшение входящего урона
                dodgeChance: 3, // 3% шанс уклониться
            };
            savePlayersData(playersData);
        }
        return playersData[nickname];
    };

    // Получение данных игрока
    const getPlayerData = (nickname) => {
        const playersData = loadPlayersData();
        if (playersData[nickname]) {
            return validatePlayerData(playersData[nickname]);
        }
        return null;
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
	
    const updatePlayerHealth = (nickname, health) => {
        return updatePlayerData(nickname, { health });
    };
	
// Интерфейс для работы с никнеймом на странице
const initNicknameUI = () => {
    const container = document.getElementById("nickname-container");

    if (!container) {
        console.error("Контейнер для никнейма не найден!");
        return;
    }

    const currentNickname = localStorage.getItem("currentNickname");

    if (currentNickname && NicknameSystem.doesNicknameExist(currentNickname)) {
        renderNickname(container, currentNickname);
        loadPlayerState(currentNickname); // Загружаем состояние игрока
    } else {
        renderNicknameForm(container);
    }
};

// Запуск интерфейса никнейма при загрузке
document.addEventListener("DOMContentLoaded", initNicknameUI);

// Получение опыта игрока
const getExperience = (nickname) => {
    const playerData = getPlayerData(nickname);
    return playerData ? playerData.experience : 0;
};

// Обновление опыта игрока
const updateExperience = (nickname, expAmount) => {
    const playerData = getPlayerData(nickname);
    if (playerData) {
        playerData.experience += expAmount;
        updatePlayerData(nickname, { experience: playerData.experience });
		
		// Проверка повышения уровня
        checkLevelUp(nickname);
				
        return true;
    }
    return false;
};

const EXP_PER_LEVEL = 1000; // Количество опыта для нового уровня

const checkLevelUp = (nickname) => {
    const playerData = getPlayerData(nickname);
    if (playerData) {
        while (playerData.experience >= playerData.level * EXP_PER_LEVEL) {
            playerData.experience -= playerData.level * EXP_PER_LEVEL;
            playerData.level += 1;

            // Улучшение характеристик при повышении уровня
            playerData.maxHealth += 20;
            playerData.attackPower += 5;
            playerData.health = playerData.maxHealth; // Полное восстановление здоровья

            // Показ уведомления о повышении уровня
            const lvlUpAlert = document.getElementById("custom-alert-lvlup");
            if (lvlUpAlert) {
                lvlUpAlert.style.display = "block";
                setTimeout(() => {
                    lvlUpAlert.style.display = "none";
                }, 2000);
            }
        }
        NicknameSystem.updatePlayerData(nickname, playerData);
    }
};


// Рендер формы ввода никнейма
const renderNicknameForm = (container) => {
    container.innerHTML = `
        <form id="nickname-form" class="nickname-form">
            <div class="form-content">
                <input type="text" id="nickname-input" class="nickname-input" placeholder="Введите никнейм" maxlength="10">
                <button type="submit" class="nickname-button"></button>
            </div>            			
    `;

    const form = document.getElementById("nickname-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("nickname-input");
        const nickname = input.value.trim();

        if (nickname) {
            const playerData = NicknameSystem.createOrLoadPlayer(nickname);
            localStorage.setItem("currentNickname", nickname);
            console.log("Загружены данные игрока:", playerData);

            location.reload(); // Перезагрузка страницы после сохранения никнейма
        }
    });
};

// Рендер никнейма
const renderNickname = (container, nickname) => {
    container.innerHTML = `
        <div id="nickname-display" class="nickname-display">
            <div class="nickname-background">
                <span class="nickname-text"><strong>${nickname}</strong></span>
                <button id="change-nickname" class="nickname-change-button"></button>
            </div>
        </div>
    `;

    const changeButton = document.getElementById("change-nickname");
    changeButton.addEventListener("click", () => {
        localStorage.removeItem("currentNickname");
        renderNicknameForm(container);
        location.reload(); // Перезагрузка страницы после удаления никнейма
    });
};

// Загрузка состояния игрока
const loadPlayerState = (nickname) => {
    const playerData = NicknameSystem.getPlayerData(nickname);
    if (playerData) {
        console.log(`Состояние для ${nickname} загружено:`, playerData);
        updateGameState(playerData); // Обновление состояния игры
    }
};

// Обновление игрового состояния (примерная реализация)
const updateGameState = (playerData) => {
    const levelElement = document.getElementById("player-level");
    const expElement = document.getElementById("player-exp");

    if (levelElement) {
        levelElement.textContent = `Уровень: ${playerData.level}`;
    }

    if (expElement) {
        expElement.textContent = `Опыт: ${playerData.experience} / ${playerData.level * EXP_PER_LEVEL}`;
    }
};

// Возвращаем доступные методы
    return {
        doesNicknameExist,
        createOrLoadPlayer,
        getPlayerData,
        updatePlayerData,
        getInventory,
        updateInventory,
        updatePlayerHealth,
        getExperience,        
        updateExperience,     
        checkLevelUp          
    };
})();

// Экспорт модуля для тестов или дальнейшей разработки
export default NicknameSystem;

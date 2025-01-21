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
                inventory: [], // Инициализация пустого инвентаря
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

// Рендер формы ввода никнейма
const renderNicknameForm = (container) => {
    container.innerHTML = `
        <form id="nickname-form" style="display: flex; gap: 5px; align-items: center;">
            <input type="text" id="nickname-input" placeholder="Введите никнейм" maxlength="20" style="flex: 1;">
            <button type="submit">Сохранить</button>
        </form>
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
        <div style="display: flex; gap: 10px; align-items: center;">
            <span><strong>${nickname}</strong></span>
            <button id="change-nickname">Сменить</button>
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
    const scoreElement = document.getElementById("player-score");

    if (levelElement) {
        levelElement.textContent = `Уровень: ${playerData.level}`;
    }

    if (scoreElement) {
        scoreElement.textContent = `Очки: ${playerData.score}`;
    }
};

// Запуск интерфейса никнейма при загрузке
document.addEventListener("DOMContentLoaded", initNicknameUI);

// Экспорт модуля для тестов или дальнейшей разработки
export default NicknameSystem;

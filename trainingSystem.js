// trainingSystem.js (модульный скрипт для тренировки)

import NicknameSystem from './nicknameSystem.js';

class TrainingSystem {
    constructor(nickname) {
        this.nickname = nickname;
        this.playerData = NicknameSystem.getPlayerData(nickname) || {};
        this.createTrainingWindow();
    }

    // Проверка наличия очков для распределения
    hasStatPoints() {
        return this.playerData.statPoints > 0;
    }

    // Улучшение характеристики (strength, attackSpeed, defense)
    upgradeStat(stat) {
        if (!this.hasStatPoints()) {
            console.log("Недостаточно очков характеристик!");
            return;
        }
        
        if (['strength', 'attackSpeed', 'defense'].includes(stat)) {
            this.playerData[stat] += 1;
            this.playerData.statPoints -= 1;
            
            // Сохранение обновленных данных
            NicknameSystem.updatePlayerData(this.nickname, this.playerData);
            this.updateUI();
            console.log(`${stat} увеличена! Новое значение:`, this.playerData[stat]);
        } else {
            console.error("Некорректный параметр для улучшения.");
        }
    }

    // Обновление интерфейса тренировочного окна
    updateUI() {
        document.getElementById("stat-strength").textContent = this.playerData.strength;
        document.getElementById("stat-attackSpeed").textContent = this.playerData.attackSpeed;
        document.getElementById("stat-defense").textContent = this.playerData.defense;
        document.getElementById("stat-points").textContent = this.playerData.statPoints;    
    }

    // Создание окна тренировки в DOM
    createTrainingWindow() {
        const trainingWindow = document.createElement("div");
        trainingWindow.id = "training-window";
        trainingWindow.style.display = "none";
        trainingWindow.innerHTML = `
            <div class="training-content">
                <h2>Тренировка</h2>
                <p>Очки характеристик: <span id="stat-points">${this.playerData.statPoints}</span></p>
                <div class="stat-upgrade">
                    <p>Сила: <span id="stat-strength">${this.playerData.strength}</span> <button id="upgrade-strength">+</button></p>
                    <p>Скорость атаки: <span id="stat-attackSpeed">${this.playerData.attackSpeed}</span> <button id="upgrade-attackSpeed">+</button></p>
                    <p>Защита: <span id="stat-defense">${this.playerData.defense}</span> <button id="upgrade-defense">+</button></p>
                </div>
                <button id="close-training">Закрыть</button>
            </div>
        `;
        document.body.appendChild(trainingWindow);
        
        // Назначение обработчиков событий
        document.getElementById("upgrade-strength").addEventListener("click", () => this.upgradeStat("strength"));
        document.getElementById("upgrade-attackSpeed").addEventListener("click", () => this.upgradeStat("attackSpeed"));
        document.getElementById("upgrade-defense").addEventListener("click", () => this.upgradeStat("defense"));
        document.getElementById("close-training").addEventListener("click", () => this.closeTrainingWindow());
    }

    // Отображение окна тренировки
    openTrainingWindow() {
        const trainingWindow = document.getElementById("training-window");
        if (trainingWindow) {
            trainingWindow.style.display = "block";
            this.updateUI();
        }
    }

    // Закрытие окна тренировки
    closeTrainingWindow() {
        const trainingWindow = document.getElementById("training-window");
        if (trainingWindow) {
            trainingWindow.style.display = "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const trainButton = document.getElementById("train-button");
    const playerNickname = localStorage.getItem("currentNickname"); // Берем никнейм как в других частях игры

    if (!playerNickname) {
        console.error("Никнейм не найден! Тренировка невозможна.");
        return;
    }

    const trainingSystem = new TrainingSystem(playerNickname);

    if (trainButton) {
        trainButton.addEventListener("click", () => trainingSystem.openTrainingWindow());
    }
});

export default TrainingSystem;

// map.js
import NicknameSystem from "./nicknameSystem.js";

document.addEventListener("DOMContentLoaded", () => {
    // Получение текущего никнейма игрока
    const currentNickname = localStorage.getItem("currentNickname");

    if (!currentNickname || !NicknameSystem.doesNicknameExist(currentNickname)) {
        console.error("Никнейм не найден или не существует. Энергия не может быть списана.");
        return;
    }

    // Функция для проверки и снятия энергии
    const spendEnergy = (nickname, amount) => {
        const playerData = NicknameSystem.getPlayerData(nickname);

        if (playerData && playerData.energy >= amount) {
            const updatedEnergy = playerData.energy - amount;
            NicknameSystem.updatePlayerData(nickname, { energy: updatedEnergy });
            return true;
        } else {
            return false;
        }
    };

    // Лес
    const forestButton = document.querySelector('[data-location="forest"]');
    forestButton.addEventListener("click", () => {
        if (spendEnergy(currentNickname, 10)) {
            window.location.href = "forest.html";
        } else {
            alert("Недостаточно энергии!");
        }
    });
    
	// Древние руины
    const ancienttempleButton = document.querySelector('[data-location="ancienttemple"]');
    ancienttempleButton.addEventListener("click", () => {
        if (spendEnergy(currentNickname, 20)) {
            window.location.href = "ancient_temple.html";
        } else {
            alert("Недостаточно энергии!");
        }
    });
	
	// Заброшенный замок
    const abandonedcastleButton = document.querySelector('[data-location="abandonedcastle"]');
    abandonedcastleButton.addEventListener("click", () => {
        if (spendEnergy(currentNickname, 25)) {
            window.location.href = "abandoned_castle.html";
        } else {
            alert("Недостаточно энергии!");
        }
    });
	
    // Кладбище
    const cemeteryButton = document.querySelector('[data-location="cemetery"]');
    cemeteryButton.addEventListener("click", () => {
        if (spendEnergy(currentNickname, 10)) {
            window.location.href = "cemetery.html";
        } else {
            alert("Недостаточно энергии!");
        }
    });	

    // Замок (без изменений)
    const castleButton = document.querySelector('[data-location="castle"]');
    castleButton.addEventListener("click", () => {
        window.location.href = "game.html";
    });
});

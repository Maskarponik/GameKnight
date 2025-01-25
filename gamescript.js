import { inventory, addToInventory, updateInventoryUI, initializeInventorySlots } from './inventory.js';
import NicknameSystem from './nicknameSystem.js';
import Market from './market.js'; // Импортируем класс Market
import Items from "./items.js";
	
document.addEventListener("DOMContentLoaded", () => {
  // Получение текущего никнейма
  const currentNickname = localStorage.getItem("currentNickname");

  if (!currentNickname) {
    console.error("Текущий никнейм не установлен в localStorage!");
    return;
  }

  // Проверка существования данных для текущего никнейма
  if (!NicknameSystem.doesNicknameExist(currentNickname)) {
    console.error("Данные для текущего никнейма отсутствуют в NicknameSystem!");
    return;
  }

  // Загрузка данных игрока через NicknameSystem
  const playerData = NicknameSystem.getPlayerData(currentNickname) || {};

  // Инициализация переменных с fallback-значениями
  let coins = playerData.coins ?? 1000;
  let level = playerData.level ?? 1;
  let health = playerData.health ?? 100;
  let maxHealth = playerData.maxHealth ?? 100;
  let energy = playerData.energy ?? 100;
  let maxEnergy = playerData.maxEnergy ?? 100;
  let attackPower = playerData.attackPower ?? 10;

  // Элементы страницы
  const mapButton = document.getElementById("map-button");
  const trainButton = document.getElementById("train-button");
  const eatButton = document.getElementById("eat-button");
  const coinsElement = document.getElementById("coins");
  const levelElement = document.getElementById("level");
  const healthBarFull = document.getElementById("health-bar");
  const energyBarFull = document.getElementById("energy-bar");
  const healthText = document.getElementById("health-text");
  const energyText = document.getElementById("energy-text");
  const inventoryButton = document.getElementById("inventory-button");
  const inventorySlotsContainer = document.getElementById("inventory-slots");

  // Проверка наличия элементов DOM
  if (!mapButton || !trainButton || !eatButton || !coinsElement || !levelElement) {
    console.error("Не все элементы DOM найдены. Проверьте HTML.");
    return;
  }

  // Инициализация инвентаря
  if (typeof initializeInventorySlots === "function") {
    initializeInventorySlots();
  } else {
    console.error("Функция initializeInventorySlots не найдена. Проверьте inventory.js.");
  }

  updateInventoryUI(inventorySlotsContainer);
  
  const expText = document.getElementById("exp-text");

  // Обновление UI
  function updateUI() {
	window.updateUI = updateUI;  
    const updatedPlayerData = NicknameSystem.getPlayerData(currentNickname);

    coinsElement.textContent = updatedPlayerData.coins;
    levelElement.textContent = updatedPlayerData.level;
    healthBarFull.style.clipPath = `inset(0 0 0 ${100 - (updatedPlayerData.health / updatedPlayerData.maxHealth) * 100}%`;
    energyBarFull.style.clipPath = `inset(0 0 0 ${100 - (updatedPlayerData.energy / updatedPlayerData.maxEnergy) * 100}%)`;
    healthText.textContent = `${updatedPlayerData.health} / ${updatedPlayerData.maxHealth}`;
    energyText.textContent = `${updatedPlayerData.energy} / ${updatedPlayerData.maxEnergy}`;
  
    const expText = document.getElementById("player-exp");
    if (expText) {      
      expText.textContent = `Опыт: ${updatedPlayerData.experience} / ${updatedPlayerData.level * 1000}`;	
    } else {
      console.warn("Элемент expText не найден!");	  
    }

    const damageText = document.getElementById("damage-text");
    if (damageText) {
      damageText.textContent = `DMG ${updatedPlayerData.attackPower}`;
    }

    updateInventoryUI(inventorySlotsContainer);
  }

  // Создаём экземпляр магазина
  const market = new Market(currentNickname);

  // Сохранение данных игрока
  function savePlayerState() {
    const updatedData = {
      coins,
      level,
      health,
      maxHealth,
      energy,
      maxEnergy,
      attackPower
    };

    NicknameSystem.updatePlayerData(currentNickname, updatedData);
  }

  // Уведомления
  function showCustomAlert(alertId) {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.style.display = "block";
      setTimeout(() => {
        alertElement.style.display = "none";
      }, 2000);
    }
  }

  function createCustomAlert(id, imageUrl) {
    const alertBox = document.createElement("div");
    alertBox.id = id;
    alertBox.style.position = "absolute";
    alertBox.style.top = "35%";
    alertBox.style.left = "52%";
    alertBox.style.transform = "translate(-50%, -50%)";
    alertBox.style.width = "600px";
    alertBox.style.height = "600px";
    alertBox.style.background = `url(${imageUrl}) no-repeat center center`;
    alertBox.style.backgroundSize = "cover";
    alertBox.style.zIndex = "1000";
    alertBox.style.display = "none";

    document.body.appendChild(alertBox);
  }

  createCustomAlert("custom-alert-train", "./assets/notification_plate_train.png");
  createCustomAlert("custom-alert-fight", "./assets/notification_plate_fight.png");
  createCustomAlert("custom-alert-eat", "./assets/notification_plate_eat.png");
  createCustomAlert("custom-alert-lvlup", "./assets/notification_plate_lvlup.png");
  createCustomAlert("custom-alert-noenergy", "./assets/notification_plate_noenergy.png");
  createCustomAlert("custom-alert-fullenergy", "./assets/notification_plate_eat_full.png");

  // События для кнопок
  inventoryButton?.addEventListener("click", () => {
    document.getElementById("inventory-modal").style.display = "block";
    const overlay = document.getElementById("overlay");
    if (overlay) overlay.style.display = "block";
  });

  document.getElementById("close-inventory")?.addEventListener("click", () => {
    document.getElementById("inventory-modal").style.display = "none";
    const overlay = document.getElementById("overlay");
    if (overlay) overlay.style.display = "none";
  });

  mapButton.addEventListener("click", () => {  
      window.location.href = "map.html";    
  });

  //Кнопка тренировки
  trainButton.addEventListener("click", () => {
    if (energy >= 10) {
      energy -= 10;
    
      // Добавляем опыт за тренировку (например, +150)
      NicknameSystem.updateExperience(currentNickname, 150); 
	 
      // Проверяем, можно ли повысить уровень
      NicknameSystem.checkLevelUp(currentNickname);

      // Обновляем данные игрока из системы никнеймов
      const updatedPlayerData = NicknameSystem.getPlayerData(currentNickname);
      level = updatedPlayerData.level;  // Обновляем уровень
      maxHealth = updatedPlayerData.maxHealth;  // Возможное увеличение макс. здоровья
      attackPower = updatedPlayerData.attackPower ?? attackPower; // Атака после повышения уровня      

      savePlayerState()
      updateUI();	  
      showCustomAlert("custom-alert-train");
    } else {
      showCustomAlert("custom-alert-noenergy");
    }

    savePlayerState();
  });

  eatButton.addEventListener("click", () => {  
    // Проверка: хватает ли монет
    if (coins >= 30) {
        coins -= 30; // Снимаем монеты

        // Восстанавливаем энергию, если есть недостача
        if (energy < maxEnergy) {
         energy = Math.min(maxEnergy, energy + 20);
       }
 
        // Восстанавливаем здоровье, если есть недостача
        if (health < maxHealth) {
          health = Math.min(maxHealth, health + 20); // Восстановим 20 здоровья
        }

        // Если и здоровье, и энергия уже на максимуме после попытки восстановления
        if (energy >= maxEnergy && health >= maxHealth) {
            showCustomAlert("custom-alert-fullenergy");
        } else {
            // Показ сообщения о том, что персонаж поел
            showCustomAlert("custom-alert-eat");
        }

        // Обновляем UI и сохраняем состояние игрока
        updateUI();
       savePlayerState();      
    } else {
      showCustomAlert("custom-alert-nocoins");
    }

    updateUI();
    savePlayerState();
  });

  updateUI(); // Обновляем интерфейс в начале
});

import { inventory, addToInventory, updateInventoryUI, initializeInventorySlots } from './inventory.js';
import NicknameSystem from './nicknameSystem.js';

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

  // Обновление UI
  function updateUI() {
    coinsElement.textContent = coins;
    levelElement.textContent = level;
    healthBarFull.style.clipPath = `inset(0 0 0 ${100 - (health / maxHealth) * 100}%`;
    energyBarFull.style.clipPath = `inset(0 0 0 ${100 - (energy / maxEnergy) * 100}%`;
    healthText.textContent = `${health} / ${maxHealth}`;
    energyText.textContent = `${energy} / ${maxEnergy}`;

    const damageText = document.getElementById("damage-text");
    if (damageText) {
      damageText.textContent = `DMG ${attackPower}`;
    }

    updateInventoryUI(inventorySlotsContainer);
  }

  // Сохранение данных игрока
  function savePlayerState() {
    const updatedData = { coins, level, health, maxHealth, energy, maxEnergy, attackPower };
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

  trainButton.addEventListener("click", () => {
    if (energy >= 10) {
      energy -= 10;
      level += 1;
      maxHealth += 20;
      health = maxHealth;
      attackPower += 5;
      updateUI();
      showCustomAlert("custom-alert-train");
    } else {
      showCustomAlert("custom-alert-noenergy");
    }
    savePlayerState();
  });

  eatButton.addEventListener("click", () => {
    if (energy >= maxEnergy) {
      showCustomAlert("custom-alert-fullenergy");
      return;
    }

    if (coins >= 50) {
      coins -= 50;
      energy = Math.min(maxEnergy, energy + 20);
      showCustomAlert("custom-alert-eat");
    } else {
      showCustomAlert("custom-alert-noenergy");
    }
    updateUI();
    savePlayerState();
  });

  updateUI(); // Обновляем интерфейс в начале
});

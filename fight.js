import { addToInventory } from './inventory.js';

// Функция для перехода на страницу
function navigateToGame() {
  window.location.href = "game.html";
}

document.addEventListener("DOMContentLoaded", () => {
  let coins = parseInt(localStorage.getItem("coins") || "1000");
  let level = parseInt(localStorage.getItem("level") || "1");
  let health = parseInt(localStorage.getItem("health") || "100");
  let maxHealth = parseInt(localStorage.getItem("maxHealth") || "100");
  let energy = parseInt(localStorage.getItem("energy") || "100");
  let maxEnergy = parseInt(localStorage.getItem("maxEnergy") || "100");
  let attackPower = parseInt(localStorage.getItem("attackPower") || "10");

  // Новый функционал: уровень гоблина
  const goblinMaxLevel = 20; // Максимальный уровень гоблина
  let goblinLevel = Math.min(level, goblinMaxLevel); // Уровень гоблина ограничен 20
  let goblinBaseHealth = 100;
  let goblinMaxHealth = goblinBaseHealth * goblinLevel;
  let goblinHealth = goblinMaxHealth;

  const goblinHealthBar = document.getElementById("goblin-health-fill");
  const attackButton = document.getElementById("attack-button");
  const coinsElement = document.getElementById("coins");
  const levelElement = document.getElementById("level");
  const healthText = document.getElementById("health-text");
  const energyText = document.getElementById("energy-text");
  const energyBarFull = document.getElementById("energy-bar");

  function updatePlayerUI() {
    coinsElement.textContent = coins;
    levelElement.textContent = level;
    healthText.textContent = `${health} / ${maxHealth}`;
    energyText.textContent = `${energy} / ${maxEnergy}`;
    energyBarFull.style.clipPath = `inset(0 0 0 ${100 - (energy / maxEnergy) * 100}%)`;
  }

  function updateGoblinUI() {
    goblinHealthBar.style.width = `${(goblinHealth / goblinMaxHealth) * 100}%`;
  }

  function calculateReward() {
    if (goblinLevel === goblinMaxLevel) {
      return Math.floor(Math.random() * (150 - 100 + 1)) + 100; // Случайная награда 100-150 для уровня 20
    }
    let baseReward = 50;
    let bonusPer10Levels = Math.floor(goblinLevel / 10) * 10;
    let minReward = baseReward + bonusPer10Levels;
    let maxReward = minReward + 50; // Диапазон награды
    return Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
  }

  // Лут с гоблина
  function calculateLoot() {
    const lootChance = Math.random();
    if (lootChance < 0.7) { // 70% шанс выпадения
      const lootItem = { name: "scraps cloth", count: 1 };
      addToInventory([lootItem]); // Используем функцию из inventory.js
	  console.log("Выпал лут:", lootItem); // Отладка
      return lootItem; // Возвращаем объект лута
    }
	console.log("Лут не выпал"); // Отладка
    return null; // Ничего не выпало
  }

  function showVictoryMessage(reward, lootItem = null) {
    const message = document.createElement("div");
    message.style.position = "fixed";
    message.style.top = "35%";
    message.style.left = "52%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.width = "500px";
    message.style.height = "500px";
    message.style.background = "url('./assets/notification_plate_fight.png') no-repeat center center";
    message.style.backgroundSize = "cover";
    message.style.zIndex = "9999";

    message.style.display = "flex";
	message.style.flexDirection = "column"; // Расположение элементов вертикально
    message.style.alignItems = "center";
    message.style.justifyContent = "center";
    message.style.color = "white";
    message.style.fontWeight = "bold";
    message.style.fontSize = "30px";
    message.style.textAlign = "center";
    message.style.paddingTop = "120px";

    // Добавление информации о награде монет
    const rewardText = document.createElement("div");
    rewardText.textContent = `Награда: ${reward} монет.`;
    message.appendChild(rewardText);

    // Добавление информации о лоскутах ткани
	if (lootItem && lootItem.count) {
      const lootText = document.createElement("div");
      lootText.style.marginTop = "20px"; // Отступ между текстами
      lootText.textContent = `Выпал: ${lootItem.count} лоскут ткани.`;
      message.appendChild(lootText);
	}  

   document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
      coins += reward;
      localStorage.setItem("coins", coins);
      navigateToGame(); // Переход на страницу после 2 секунд
    }, 2000);
  }

  attackButton.addEventListener("click", () => {
    if (goblinHealth > 0) {
      goblinHealth -= attackPower;
      updateGoblinUI();

      if (goblinHealth <= 0) {
        goblinHealth = 0;
        updateGoblinUI();
        const reward = calculateReward();
        const lootItem = calculateLoot(); // Получаем лут (если есть)
		console.log("Передано в showVictoryMessage:", { reward, lootItem }); // Отладка
        showVictoryMessage(reward, lootItem); // Передаем награду и лут в функцию
      }
    }
  });

  // Инициализация
  goblinMaxHealth = goblinBaseHealth * goblinLevel;
  goblinHealth = goblinMaxHealth;
  updatePlayerUI();
  updateGoblinUI();
});

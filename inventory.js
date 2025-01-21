// inventory.js

import NicknameSystem from "./nicknameSystem.js";

// Получение текущего никнейма
let currentNickname = localStorage.getItem("currentNickname");

if (!currentNickname || !NicknameSystem.doesNicknameExist(currentNickname)) {
  console.error("Не найден текущий никнейм. Инвентарь не может быть инициализирован.");
}

// Переменная для хранения информации о переносимом предмете
let draggedItemIndex = null;

// Функция загрузки инвентаря для текущего никнейма
function loadInventoryForNickname(nickname) {
  const playerData = NicknameSystem.getPlayerData(nickname);
  return playerData?.inventory || [];
}

// Инициализация инвентаря для текущего никнейма
export let inventory = loadInventoryForNickname(currentNickname);

// Обновление текущего никнейма и перезагрузка инвентаря
export function updateCurrentNickname(newNickname) {
  if (NicknameSystem.doesNicknameExist(newNickname)) {
    currentNickname = newNickname;
    localStorage.setItem("currentNickname", newNickname);
    inventory = loadInventoryForNickname(newNickname);
    console.log(`Инвентарь обновлён для никнейма: ${newNickname}`);
  } else {
    console.error("Никнейм не существует. Обновление не выполнено.");
  }
}

// Сохранение инвентаря игрока в систему никнеймов
export function saveInventoryToNicknameSystem() {
  if (currentNickname) {
    const playerData = NicknameSystem.getPlayerData(currentNickname);
    if (playerData) {
      playerData.inventory = inventory;
      NicknameSystem.updatePlayerData(currentNickname, playerData);
    } else {
      console.error("Ошибка: Данные игрока не найдены.");
    }
  } else {
    console.error("Невозможно сохранить инвентарь: текущий никнейм отсутствует.");
  }
}

// Добавление предметов в инвентарь
export function addToInventory(items) {
  items.forEach((item) => {
    const existingSlot = inventory.find((slot) => slot.name === item.name);
    if (existingSlot) {
      existingSlot.count += item.count;
    } else {
      const emptySlot = inventory.find((slot) => !slot.name);
      if (emptySlot) {
        emptySlot.name = item.name;
        emptySlot.count = item.count;
      } else {
        console.warn("Инвентарь заполнен!");
      }
    }
  });
  saveInventoryToNicknameSystem();
}

let isSellingMode = false;

// Обработчики событий drag-and-drop
export function setupDragAndDrop(containerElement) {
  containerElement.addEventListener("dragstart", (event) => {
	if (isSellingMode) return; // Блокируем перетаскивание  
    const slotElement = event.target.closest(".inventory-slot");
    if (!slotElement) return;

    draggedItemIndex = Number(slotElement.getAttribute("data-slot-id")) - 1;
    event.dataTransfer.setData("text/plain", draggedItemIndex);
    event.dataTransfer.effectAllowed = "move";
  });

  containerElement.addEventListener("dragover", (event) => {
	if (isSellingMode) return; // Блокируем перемещение  
    event.preventDefault(); // Разрешить сброс
    event.dataTransfer.dropEffect = "move";
  });

  containerElement.addEventListener("drop", (event) => {
	if (isSellingMode) return; // Блокируем сброс  
    event.preventDefault();

    const targetSlotElement = event.target.closest(".inventory-slot");
    if (!targetSlotElement || draggedItemIndex === null) return;

    const targetSlotIndex = Number(targetSlotElement.getAttribute("data-slot-id")) - 1;

    if (draggedItemIndex !== targetSlotIndex) {
      // Обмен местами предметов
      const temp = inventory[draggedItemIndex];
      inventory[draggedItemIndex] = inventory[targetSlotIndex];
      inventory[targetSlotIndex] = temp;

      // Сохранить изменения и обновить интерфейс
      saveInventoryToNicknameSystem();
      updateInventoryUI(containerElement);
    }

    draggedItemIndex = null;
  });
}

// Таблица цен предметов
const itemPrices = {
    "scraps cloth": 20, // Имя предмета -> Цена
	"bones": 50, // Имя предмета -> Цена
    // Добавьте больше предметов и их цен
};
	
// Продажа предметов в инвентаре 
function initializeInventory() {
    const sellAllButton = document.getElementById("sell-all-button");
    const confirmationModal = document.getElementById("confirmation-modal");
    const confirmYesButton = document.getElementById("confirm-yes-button");
    const confirmNoButton = document.getElementById("confirm-no-button");
    const inventorySlots = document.querySelectorAll(".inventory-slot"); // Все слоты    
   
    if (!sellAllButton || !confirmationModal || !confirmYesButton || !confirmNoButton) {
        console.error("Элементы модального окна не найдены.");
        return;
    }

    // Открыть модальное окно
    sellAllButton.addEventListener("click", () => {
        confirmationModal.style.display = "block"; // Показываем окно
        console.log("Модальное окно отображается");
    });

    // Нажатие на кнопку "Да"
    confirmYesButton.addEventListener("click", () => {
        let totalValue = 0; // Сумма стоимости предметов

        inventorySlots.forEach(slot => {
            const item = slot.querySelector("img"); // Предмет в слоте
            if (item) {
                const itemName = item.getAttribute("data-name"); // Имя предмета
                const itemCount = parseInt(item.getAttribute("data-count") || "1", 10); // Количество предметов
                const itemValue = itemPrices[itemName] || 0; // Цена предмета
                totalValue += itemValue * itemCount; // Увеличиваем общую стоимость
                slot.innerHTML = ""; // Очищаем слот
            }
        });

        if (totalValue > 0) {
            playerCoins += totalValue; // Увеличиваем монеты игрока
            console.log(`Все предметы проданы! Баланс: ${playerCoins}`);
        } else {
            console.log("Нет предметов для продажи.");
        }

        // Закрываем модальное окно
        confirmationModal.style.display = "none";
    });

    // Нажатие на кнопку "Нет"
    confirmNoButton.addEventListener("click", () => {
        confirmationModal.style.display = "none"; // Закрываем окно
        console.log("Продажа отменена");
    });
}

// Обновление интерфейса инвентаря
export function updateInventoryUI(containerElement) {
  containerElement.innerHTML = ""; // Очищаем все слоты
  inventory.forEach((slot, index) => {
    const slotElement = document.createElement("div");
    slotElement.classList.add("inventory-slot");
    slotElement.setAttribute("data-slot-id", index + 1);
    slotElement.setAttribute("draggable", "true"); // Разрешить перетаскивание

    if (slot.name) {
      const img = document.createElement("img");
      img.src = `./assets/${slot.name.replace(/\s/g, "_")}.png`;
      img.alt = slot.name;
      img.style.width = "80%";
      img.style.height = "80%";
      slotElement.appendChild(img);

      const count = document.createElement("div");
      count.textContent = slot.count;
      count.style.position = "absolute";
      count.style.bottom = "5px";
      count.style.right = "5px";
      count.style.color = "white";
      count.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      count.style.padding = "2px 5px";
      count.style.borderRadius = "3px";
      slotElement.appendChild(count);
    }	
    	
    containerElement.appendChild(slotElement);
  });

  // Подключаем drag-and-drop функционал
  setupDragAndDrop(containerElement);
}

// Инициализация пустых слотов в инвентаре
export function initializeInventorySlots(slotCount = 98) {
  while (inventory.length < slotCount) {
    inventory.push({ id: inventory.length + 1, name: null, count: 0 });
  }
  saveInventoryToNicknameSystem();
}

// Подсчёт монет в никнейм системе
function addCoinsToNickname(nickname, coins) {
  const playerData = NicknameSystem.getPlayerData(nickname);
  if (playerData) {
    playerData.coins = (playerData.coins || 0) + coins;
    NicknameSystem.updatePlayerData(nickname, playerData);
  }
}

// Продажа всех предметов
function sellAllItems() {
    // Подсчёт общей стоимости всех предметов в инвентаре
    const totalCoins = inventory.reduce((sum, slot) => {
        const itemPrice = itemPrices[slot.name] || 0; // Получаем цену предмета
        return sum + (slot.count || 0) * itemPrice; // Умножаем количество на цену
    }, 0);

    // Проверяем, есть ли предметы для продажи
    if (totalCoins > 0) {
        inventory.forEach(slot => {
            slot.name = null; // Убираем название предмета
            slot.count = 0; // Обнуляем количество предметов
        });
        addCoinsToNickname(currentNickname, totalCoins); // Добавляем монеты игроку
        saveInventoryToNicknameSystem(); // Сохраняем инвентарь
        updateInventoryUI(document.getElementById("inventory-slots")); // Обновляем интерфейс
        alert(`Вы продали все предметы за ${totalCoins} монет!`);
    } else {
        alert("Ваш инвентарь пуст!"); // Если предметов нет
    }
}

let selectedSlots = new Set();

// Выделение слотов для продажи
function toggleSlotSelection(slotIndex) {
  console.log(`Попытка выделить слот: ${slotIndex}`);

  if (!isSellingMode) {
    console.warn("Выделение доступно только в режиме продажи");
    return;
  }

  const slotElement = document.querySelector(`[data-slot-id="${slotIndex}"]`);

  console.log("Текущие выделенные слоты:", Array.from(selectedSlots));

  if (selectedSlots.has(slotIndex)) {
    selectedSlots.delete(slotIndex);
    console.log(`Слот ${slotIndex} снят с выделения.`);
    slotElement.classList.remove("selected");
  } else {
    selectedSlots.add(slotIndex);
    console.log(`Слот ${slotIndex} выделен.`);
    slotElement.classList.add("selected");
  }

  console.log("Обновленные выделенные слоты:", Array.from(selectedSlots));
}

// Функция для открытия подтверждения продажи
function openConfirmationModal(sellCallback, message) {
  console.log("Открытие модального окна подтверждения продажи.");
  const modal = document.getElementById("confirmation-modal");
  if (!modal) {
      console.error("Модальное окно не найдено в DOM!");
      return;
  }
	
  document.getElementById("confirmation-text").textContent = message;
  
  // Убираем скрывающий класс
  modal.classList.remove("hidden");
  modal.style.display = "block";

  
  document.getElementById("confirm-yes-button").onclick = () => {
    sellCallback();
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  document.getElementById("confirm-no-button").onclick = () => {
    console.log("Продажа отменена");
    modal.classList.add("hidden");
	modal.style.display = "none";
  };
}

// Продажа выбранных предметов
function sellSelectedItems() {
  console.log("Функция sellSelectedItems вызвана");
  const selectedItems = Array.from(selectedSlots).map(index => inventory[index - 1]);
  console.log("Выбранные предметы:", selectedItems);
  
  const totalCoins = selectedItems.reduce((sum, slot) => {
    const itemPrice = itemPrices[slot.name] || 0; // Цена предмета из таблицы
    return sum + (slot.count || 0) * itemPrice; // Учитываем количество и цену
  }, 0);

  if (selectedItems.length === 0) {
    alert("Вы не выбрали ни одного предмета!");
    return;
  }

  selectedItems.forEach(slot => {
    slot.name = null;
    slot.count = 0;
  });

  addCoinsToNickname(currentNickname, totalCoins);
  saveInventoryToNicknameSystem();
  console.log(`Монеты добавлены: ${totalCoins}`);
  alert(`Вы продали выбранные предметы за ${totalCoins} монет!`);

  updateInventoryUI(document.getElementById("inventory-slots"));
}

// Обработчики кнопок продажи
document.addEventListener("DOMContentLoaded", () => {
  const sellAllButton = document.getElementById("sell-all-button");
  const sellSelectedButton = document.getElementById("sell-selected-button");
  const inventorySlotsContainer = document.getElementById("inventory-slots");

  if (!sellAllButton || !sellSelectedButton || !inventorySlotsContainer) {
    console.error("Не удалось найти элементы для кнопок или инвентаря.");
    return;
  }

  sellAllButton.addEventListener("click", () => {
    openConfirmationModal(sellAllItems, "Вы уверены, что хотите продать все предметы?");
  });

  sellSelectedButton.addEventListener("click", () => {
    if (!isSellingMode) {
        isSellingMode = true;
        console.log("Режим продажи активирован");
        return;  // Выход, чтобы сначала активировать режим продажи
    }

    if (selectedSlots.size === 0) {
      console.warn("Нет выделенных предметов для продажи.");
      alert("Сначала выберите предметы для продажи!");
      return;
    }

    console.log("Режим продажи уже активен, открываю подтверждение...");
    openConfirmationModal(() => {
        sellSelectedItems();
    }, "Вы уверены, что хотите продать выбранные предметы?");
  });

  // Добавление выделения при клике на слот
  inventorySlotsContainer.addEventListener("click", (event) => {
    const slot = event.target.closest(".inventory-slot");
    if (!slot) return;
    toggleSlotSelection(Number(slot.getAttribute("data-slot-id")));
  });
});

function resetSellMode() {
  isSellingMode = false;
  selectedSlots.clear();
  document.querySelectorAll(".inventory-slot").forEach((slot) => {
    slot.classList.remove("selected");
  });
  console.log("Режим продажи завершён, слоты очищены.");
}

initializeInventory();

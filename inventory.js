// inventory.js

import NicknameSystem from "./nicknameSystem.js";
import Items from "./items.js";

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

// Инициализация пустых слотов в инвентаре
export function initializeInventorySlots(slotCount = 60) {
  while (inventory.length < slotCount) {
    inventory.push({ id: null, name: null, count: 0 }); // Пустой слот без фиктивного ID
  }
  // Убираем лишние слоты, если их больше, чем нужно
  if (inventory.length > slotCount) {
    inventory = inventory.slice(0, slotCount);
  }
  saveInventoryToNicknameSystem();
}

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
  const playerInventory = NicknameSystem.getInventory(currentNickname);
  if (!playerInventory) return;

  items.forEach((item) => {
    // Проверяем, существует ли предмет в items.js
    const itemData = Items.getItemById(item.id);
    if (!itemData) {
      console.error(`Предмет с ID ${item.id} не найден в items.js`);
      return;
    }

    // Проверяем, есть ли уже такой предмет в инвентаре
    const existingItem = playerInventory.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.count += item.count; // Увеличиваем количество
    } else {
      // Ищем первый пустой слот
      const emptySlotIndex = playerInventory.findIndex(i => !i || !i.id);
      if (emptySlotIndex === -1) {
        console.warn("Инвентарь заполнен! Предмет не может быть добавлен.");
        return;
      }

      // Добавляем новый предмет в пустой слот
      playerInventory[emptySlotIndex] = {
        id: item.id,
        name: itemData.name, // Название из items.js
        count: item.count,
      };
    }
  });

  NicknameSystem.updateInventory(currentNickname, playerInventory); // Сохраняем инвентарь
  console.log("Инвентарь обновлён:", playerInventory);
}


let isSellingMode = false;

document.addEventListener("dragover", (e) => {
  e.preventDefault();  // Отменяем стандартное поведение
});

// Обработчики событий drag-and-drop
export function setupDragAndDrop(containerElement) {
  containerElement.addEventListener("dragstart", (event) => {
    if (isSellingMode) return; // Блокируем перетаскивание в режиме продажи

    const slotElement = event.target.closest(".inventory-slot");
    if (!slotElement) return;

    const draggedItemId = slotElement.getAttribute("data-item-id");
    if (!draggedItemId || draggedItemId === "null") {
      console.warn("Попытка перетащить пустой слот.");
      event.preventDefault(); // Запрещаем перетаскивание пустого слота
      return;
    }
    
    event.dataTransfer.setData("text/plain", draggedItemId);
    event.dataTransfer.effectAllowed = "move";

    console.log(`Начато перетаскивание предмета с ID: ${draggedItemId}`);
  });


  containerElement.addEventListener("dragover", (event) => {
    if (isSellingMode) return; // Блокируем перемещение в режиме продажи

    event.preventDefault(); // Разрешаем сброс
    event.dataTransfer.dropEffect = "move";
  });

  containerElement.addEventListener("drop", (event) => {
    if (isSellingMode) return; // Блокируем сброс в режиме продажи

    event.preventDefault();

    const targetSlotElement = event.target.closest(".inventory-slot");
    if (!targetSlotElement) {
      console.warn("Целевой слот не найден.");
      return;
    }

    const draggedItemId = event.dataTransfer.getData("text/plain");
    const targetSlotIndex = Number(targetSlotElement.getAttribute("data-slot-id")) - 1;
 
    const draggedItem = inventory.find(item => item.id === Number(draggedItemId));
    if (!draggedItem) {
      console.error("Перетаскиваемый предмет не найден.");
      return;
    }

    if (targetSlotIndex < 0 || targetSlotIndex >= inventory.length) {
      console.warn("Попытка переместить предмет в несуществующий слот.");
      return;
    }

    // Если слот пустой
    if (!inventory[targetSlotIndex].id) {
      const draggedItemIndex = inventory.indexOf(draggedItem);

      inventory[draggedItemIndex] = { id: null, name: null, count: 0 }; // Очищаем старый слот
      inventory[targetSlotIndex] = { ...draggedItem }; // Перемещаем предмет

      console.log(`Предмет с ID ${draggedItem.id} перемещен в пустой слот ${targetSlotIndex + 1}.`);
    } else {
      // Обмен местами
      const targetItem = inventory[targetSlotIndex];
      const draggedItemIndex = inventory.indexOf(draggedItem);

      [inventory[draggedItemIndex], inventory[targetSlotIndex]] =
        [inventory[targetSlotIndex], inventory[draggedItemIndex]];

      console.log(`Предметы с ID ${draggedItem.id} и ${targetItem.id} поменялись местами.`);
    }

    saveInventoryToNicknameSystem();
    updateInventoryUI(containerElement);
  });
}


// Таблица цен предметов
const itemPrices = (id) => {
  const item = Items.getItemById(id);
  return item ? item.price || item.sellPrice || 0 : 0;
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

function useItem(slot, index) {
  const item = Items.getItemById(slot.id);
  if (!item || item.type !== "consumable") return;

  const playerData = NicknameSystem.getPlayerData(currentNickname);

  // Применяем эффект предмета
  if (item.effect.health) {
    playerData.health = Math.min(playerData.health + item.effect.health, playerData.maxHealth);    
  }
  if (item.effect.energy) {
    playerData.energy = Math.min(playerData.energy + item.effect.energy, playerData.maxEnergy);  
  }

  // Уменьшаем количество предмета или удаляем
  if (slot.count > 1) {
    inventory[index].count--;
  } else {
    inventory.splice(index, 1); // Удаляем предмет из инвентаря
  }

  // Сохраняем обновлённые данные
  console.log("Данные перед обновлением (зелье):", playerData);
  NicknameSystem.updatePlayerData(currentNickname, playerData);
  NicknameSystem.updateInventory(currentNickname, inventory);
  updateInventoryUI(document.getElementById("inventory-slots")); 
  window.updateUI();   
  console.log(`Текущее здоровье: ${playerData.health}/${playerData.maxHealth}`);  
}


// Обновление интерфейса инвентаря
export function updateInventoryUI(containerElement) {
  containerElement.innerHTML = ""; // Очищаем контейнер
  
  inventory.forEach((slot, index) => {
    const item = Items.getItemById(slot.id);

    const slotElement = document.createElement("div");
    slotElement.classList.add("inventory-slot");
    slotElement.setAttribute("data-slot-id", index + 1); // Уникальный ID для слота
    slotElement.setAttribute("data-item-id", slot.id || "");
    slotElement.setAttribute("draggable", slot.id ? "true" : "false");

    if (item) {
      const img = document.createElement("img");
      img.src = item.image || "";
      img.alt = item.name || "Unknown Item";
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
    
      // Если предмет расходуемый, добавляем кнопку "Использовать"
      if (item.type === "consumable") {
        const useButton = document.createElement("button");
        useButton.textContent = "Использовать";
        useButton.classList.add("use-button");

        useButton.onclick = () => useItem(slot, index);
        slotElement.appendChild(useButton);
      }
    }

    containerElement.appendChild(slotElement);
  });

  setupDragAndDrop(containerElement); // Подключаем события
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
export function sellAllItems() {
  let totalCoins = 0;

  inventory.forEach((slot) => {
    const item = Items.getItemById(slot.id);
    if (item && item.sellPrice) {
      totalCoins += item.sellPrice * slot.count; // Увеличиваем общую стоимость
    }
    slot.count = 0; // Обнуляем количество предметов
  });

  inventory = inventory.filter((slot) => slot.count > 0); // Убираем пустые слоты
  addCoinsToNickname(currentNickname, totalCoins); // Добавляем монеты игроку
  saveInventoryToNicknameSystem(); // Сохраняем инвентарь
  updateInventoryUI(document.getElementById("inventory-slots")); // Обновляем интерфейс
  // Обновляем текст в <span id="coins">
  const coinsElement = document.getElementById("coins");
  const playerData = NicknameSystem.getPlayerData(currentNickname);
  if (coinsElement && playerData) {
    coinsElement.textContent = playerData.coins || 0; // Устанавливаем актуальное количество монет
  } else {
    console.error("Не удалось обновить отображение монет. Проверьте элемент #coins или данные игрока.");
  }
  alert(`Вы продали все предметы за ${totalCoins} монет!`);
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
export function sellSelectedItems() {
  const selectedItems = Array.from(selectedSlots).map((index) => inventory[index - 1]);
  let totalCoins = 0;

  selectedItems.forEach((slot) => {
    const item = Items.getItemById(slot.id);
    if (item && item.sellPrice) {
      totalCoins += item.sellPrice * slot.count; // Увеличиваем общую стоимость
      slot.count = 0; // Продаем предметы
    }
  });

  inventory = inventory.filter((slot) => slot.count > 0); // Убираем пустые слоты
  addCoinsToNickname(currentNickname, totalCoins);
  saveInventoryToNicknameSystem();
  updateInventoryUI(document.getElementById("inventory-slots"));
  // Обновляем текст в <span id="coins">
  const coinsElement = document.getElementById("coins");
  const playerData = NicknameSystem.getPlayerData(currentNickname);
  if (coinsElement && playerData) {
    coinsElement.textContent = playerData.coins || 0; // Устанавливаем актуальное количество монет
  } else {
    console.error("Не удалось обновить отображение монет. Проверьте элемент #coins или данные игрока.");
  }
  
  alert(`Вы продали выбранные предметы за ${totalCoins} монет!`);
}

// Обновление монет
function updateCoinsDisplay() {
  const coinsElement = document.getElementById("coins-display"); // Ищем элемент с монетами
  const playerData = NicknameSystem.getPlayerData(currentNickname); // Получаем данные игрока

  if (coinsElement && playerData) {
    coinsElement.textContent = playerData.coins || 0; // Устанавливаем текущее количество монет
  } else {
    console.error("Не удалось обновить отображение монет. Проверьте HTML и данные игрока.");
  }
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

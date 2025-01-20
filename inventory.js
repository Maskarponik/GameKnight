// inventory.js

// Инициализация инвентаря из localStorage или создание нового
export const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");

// Сохранение инвентаря в localStorage
export function saveInventoryToLocalStorage() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
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
  saveInventoryToLocalStorage();
}

// Обновление интерфейса инвентаря
export function updateInventoryUI(containerElement) {
  containerElement.innerHTML = ""; // Очищаем все слоты
  inventory.forEach((slot, index) => {
    const slotElement = document.createElement("div");
    slotElement.classList.add("inventory-slot");
    slotElement.setAttribute("data-slot-id", index + 1);

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
}

// Инициализация пустых слотов в инвентаре
export function initializeInventorySlots(slotCount = 98) {
  while (inventory.length < slotCount) {
    inventory.push({ id: inventory.length + 1, name: null, count: 0 });
  }
  saveInventoryToLocalStorage();
}

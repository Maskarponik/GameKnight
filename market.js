// market.js - Магазин модульный скрипт

import NicknameSystem from "./nicknameSystem.js";
import { getItems } from "./items.js";
import { inventory, saveInventoryToNicknameSystem, updateInventoryUI } from './inventory.js';

export default class Market {
  constructor(player, buttonId = "open-market-button") {
    this.nickname = localStorage.getItem("currentNickname");
    this.allowedItemIds = [1, 2, 3];
    this.items = this.filterAllowedItems(getItems());
    this.cart = {};
    this.buttonId = buttonId;
    this.initOpenMarketButton();
    this.activeDetails = null; // Для управления открытыми описаниями
  }

  filterAllowedItems(items) {
    return items.filter(item => this.allowedItemIds.includes(item.id));
  }

  open() {
    if (document.getElementById("market-container")) {
      console.warn("Магазин уже открыт!");
      return;
    }
    this.createMarketUI();
  }

  initOpenMarketButton() {
    const openMarketButton = document.getElementById(this.buttonId);
    if (!openMarketButton) {
      console.error(`Кнопка с ID "${this.buttonId}" не найдена!`);
      return;
    }

    openMarketButton.addEventListener("click", () => {
      if (document.getElementById("market-container")) return;
      this.createMarketUI();
    });
  }

  createMarketUI() {
    const marketContainer = document.createElement("div");
    marketContainer.id = "market-container";
	
	// Общее окно описания
    const detailsContainer = document.createElement("div");
    detailsContainer.className = "item-details-container";
    marketContainer.appendChild(detailsContainer);

    const itemList = document.createElement("div");
    itemList.id = "item-list";
    
    this.items.forEach((item) => {
      if (!this.allowedItemIds.includes(item.id)) return;

      // Основной контейнер предмета
      const itemContainer = document.createElement("div");
      itemContainer.className = "item-container";
      
      // Иконка предмета с обработчиком клика
      const itemIcon = document.createElement("div");
      itemIcon.className = "item-icon";
      itemIcon.style.backgroundImage = `url(${item.image})`;
      itemIcon.onclick = (e) => this.toggleItemDetails(e, item);

      // Цена под иконкой
      const itemPrice = document.createElement("div");
      itemPrice.className = "item-price";
      itemPrice.textContent = `${item.price}`;
       
      // Собираем основной контейнер
      itemContainer.appendChild(itemIcon);
      itemContainer.appendChild(itemPrice);      
      itemList.appendChild(itemContainer);
	  
    });
    
    marketContainer.appendChild(itemList);

    // Итоговая информация
    const totalContainer = document.createElement("div");
    totalContainer.id = "total-container";

    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Итоговая сумма: 0 монет";
    totalLabel.id = "total-label";
    totalContainer.appendChild(totalLabel);

    marketContainer.appendChild(totalContainer);

    // Кнопка покупки
    const buyButton = document.createElement("button");
    buyButton.textContent = "Купить";
    buyButton.id = "buy-button";
    buyButton.onclick = () => this.confirmPurchase();
    marketContainer.appendChild(buyButton);

    // Кнопка закрытия
    const closeButton = document.createElement("button");
    closeButton.id = "close-market-button";
    closeButton.onclick = () => this.closeMarket();
    marketContainer.appendChild(closeButton);

    document.body.appendChild(marketContainer);
  }

  toggleItemDetails(event, item) {
    const detailsContainer = document.querySelector('#market-container .item-details-container');
  
    // Проверяем, открыто ли текущее окно, и закрываем его, если оно уже открыто для другого предмета
    if (detailsContainer.classList.contains('active') && detailsContainer.dataset.itemId === item.id.toString()) {
        detailsContainer.classList.remove('active');
        detailsContainer.innerHTML = ''; // Очищаем окно
        return;
    }
  
    // Очищаем предыдущие обработчики
    detailsContainer.innerHTML = '';
	detailsContainer.dataset.itemId = item.id; // Сохраняем ID предмета

    // Создаем содержимое окна
    const detailsIcon = document.createElement("div");
    detailsIcon.className = "item-details-icon";
    detailsIcon.style.backgroundImage = `url(${item.image})`;

    const detailsName = document.createElement("div");
    detailsName.className = "item-name";
    detailsName.textContent = item.name;
		
    const detailsDescription = document.createElement("div");
    detailsDescription.className = "item-description";
    detailsDescription.textContent = item.description;

    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.textContent = "Добавить в корзину";
	addButton.onclick = () => this.addToCart(item.id);
    
    // Собираем окно
    detailsContainer.appendChild(detailsIcon);
    detailsContainer.appendChild(detailsName);
    detailsContainer.appendChild(detailsDescription);
    detailsContainer.appendChild(addButton);

    // Переключаем видимость
    detailsContainer.classList.add('active');	
  }

  closeMarket() {
    const marketContainer = document.getElementById("market-container");
    if (marketContainer) {
      marketContainer.remove();
    }
    this.activeDetails = null;
  }

  addToCart(itemId) {
    if (!this.cart[itemId]) {
      this.cart[itemId] = 0;
    }
    this.cart[itemId]++;
    this.updateTotal();
  }

  updateTotal() {
    const total = Object.entries(this.cart).reduce((sum, [itemId, quantity]) => {
      const item = this.items.find((item) => item.id === parseInt(itemId));
      return sum + item.price * quantity;
    }, 0);

    const totalLabel = document.getElementById("total-label");
    totalLabel.textContent = `Итоговая сумма: ${total}`;

    if (total === 0) {
      this.cart = {};
    }
  }

  confirmPurchase() {
    const total = Object.entries(this.cart).reduce((sum, [itemId, quantity]) => {
      const item = this.items.find((item) => item.id === parseInt(itemId));
      return sum + item.price * quantity;
    }, 0);

    const playerData = NicknameSystem.getPlayerData(this.nickname);

    if (playerData) {
      const currentCoins = playerData.coins;

      if (currentCoins >= total) {
        playerData.coins -= total;

        const itemsToAdd = Object.entries(this.cart).map(([itemId, quantity]) => ({
          id: parseInt(itemId),
          count: quantity,
        }));

        itemsToAdd.forEach(item => {
          const emptySlotIndex = inventory.findIndex(slot => !slot || slot.id === null);

          if (emptySlotIndex !== -1) {
            inventory[emptySlotIndex] = item;
          } else {
            alert("Инвентарь заполнен! Освободите место.");
          }
        });

        saveInventoryToNicknameSystem();
        
        const inventoryContainer = document.getElementById("inventory-slots");
        if (inventoryContainer) {
          updateInventoryUI(inventoryContainer);
        }

        NicknameSystem.updatePlayerData(this.nickname, {
          coins: playerData.coins,
          inventory: inventory,
        });

        const coinsElement = document.getElementById("coins");
        if (coinsElement) {
          coinsElement.textContent = playerData.coins;
        }

        this.cart = {};
        alert("Покупка успешно завершена!");
        this.updateTotal();
      } else {
        alert("Недостаточно монет!");
      }
    } else {
      console.error("Не удалось загрузить данные игрока.");
    }
  }
}
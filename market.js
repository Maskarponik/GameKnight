// market.js - Магазин модульный скрипт

import NicknameSystem from "./nicknameSystem.js";
import { getItems } from "./items.js";
import { inventory, saveInventoryToNicknameSystem, updateInventoryUI } from './inventory.js';

export default class Market {
  constructor(player, buttonId = "open-market-button") {
    this.nickname = localStorage.getItem("currentNickname"); // Получаем текущий никнейм
    this.items = Array.isArray(getItems()) ? getItems() : [];
    this.cart = {}; // Объект для хранения выбранных предметов
    this.buttonId = buttonId; // ID кнопки открытия магазина
    this.initOpenMarketButton(); // Привязка функционала открытия магазина
  }
  
    open() {
      // Проверяем, если магазин уже открыт, ничего не делаем
      if (document.getElementById("market-container")) {
          console.warn("Магазин уже открыт!");
          return;
      }

      // Создаём интерфейс магазина
      this.createMarketUI();
  }

  // Привязываем событие открытия магазина к кнопке
  initOpenMarketButton() {
    const openMarketButton = document.getElementById(this.buttonId);
    if (!openMarketButton) {
      console.error(`Кнопка с ID "${this.buttonId}" не найдена!`);
      return;
    }

    openMarketButton.addEventListener("click", () => {
      // Проверяем, если магазин уже открыт, ничего не делаем
      if (document.getElementById("market-container")) return;

      this.createMarketUI();
    });
  }

  // Создание интерфейса магазина
  createMarketUI() {
    // Основное окно магазина
    const marketContainer = document.createElement("div");
    marketContainer.id = "market-container";

    // Заголовок магазина
    const title = document.createElement("h2");
    title.textContent = "Магазин";
    marketContainer.appendChild(title);

    // Список предметов
    const itemList = document.createElement("div");
    itemList.id = "item-list";
    this.items.forEach((item) => {
      const itemRow = document.createElement("div");
      itemRow.className = "item-row";

      const itemName = document.createElement("span");
      itemName.textContent = `${item.name} - ${item.price} монет`;
      itemName.className = "item-name";

      const addButton = document.createElement("button");
      addButton.textContent = "+";
      addButton.className = "add-button";
      addButton.onclick = () => this.addToCart(item.id);

      itemRow.appendChild(itemName);
      itemRow.appendChild(addButton);
      itemList.appendChild(itemRow);
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

    // Кнопка закрытия магазина
    const closeButton = document.createElement("button");
    closeButton.id = "close-market-button";
    closeButton.onclick = () => this.closeMarket();
    marketContainer.appendChild(closeButton);
	
    // Добавляем окно магазина на страницу
    document.body.appendChild(marketContainer);
  }
    closeMarket() {
      const marketContainer = document.getElementById("market-container");
      if (marketContainer) {
        marketContainer.remove();
      }
    }

  // Добавление предметов в корзину
  addToCart(itemId) {
    if (!this.cart[itemId]) {
      this.cart[itemId] = 0;
    }
    this.cart[itemId]++;
    this.updateTotal();
  }

  // Обновление итоговой суммы
  updateTotal() {
      const total = Object.entries(this.cart).reduce((sum, [itemId, quantity]) => {
          const item = this.items.find((item) => item.id === parseInt(itemId));
          return sum + item.price * quantity;
      }, 0);

      const totalLabel = document.getElementById("total-label");
      totalLabel.textContent = `Итоговая сумма: ${total} монет`;

      if (total === 0) {
          this.cart = {};
      }
  }

  // Подтверждение покупки
  confirmPurchase() {
      const total = Object.entries(this.cart).reduce((sum, [itemId, quantity]) => {
          const item = this.items.find((item) => item.id === parseInt(itemId));
          return sum + item.price * quantity;
      }, 0);

      // Получаем актуальные данные игрока через NicknameSystem
      const playerData = NicknameSystem.getPlayerData(this.nickname);

      // Если данные игрока существуют
      if (playerData) {
          const currentCoins = playerData.coins ; // Берём монеты из NicknameSystem

          if (currentCoins >= total) {
              // Списываем монеты
              playerData.coins  -= total;			  

              // Добавляем предметы в инвентарь              
              const itemsToAdd = Object.entries(this.cart).map(([itemId, quantity]) => ({
                id: parseInt(itemId),
                count: quantity,
              }));      
			  
			  // Используем импортированную переменную inventory напрямую
              itemsToAdd.forEach(item => {
                  const existingItem = inventory.find(invItem => invItem.id === item.id);
                  if (existingItem) {
                      existingItem.count += item.count;
                  } else {
                      inventory.push(item);
                  }
              });
			  			  
			  // Сохраняем обновлённый инвентарь
              saveInventoryToNicknameSystem();;
			  
			  // Обновляем интерфейс инвентаря
              const inventoryContainer = document.getElementById("inventory-slots"); 
              if (inventoryContainer) {
                  updateInventoryUI(inventoryContainer);
              } else {
                  console.error("Элемент инвентаря не найден, обновление интерфейса невозможно.");
              }		
			  
			  // Обновляем данные игрока через NicknameSystem
              NicknameSystem.updatePlayerData(this.nickname, {
                  coins: playerData.coins,
                  inventory: inventory, // Передаём обновлённый инвентарь
              });
			  // Обновляем отображение монет на UI
              const coinsElement = document.getElementById("coins");
              if (coinsElement) {
                  coinsElement.textContent = playerData.coins;
              } else {
                  console.error("Элемент отображения монет не найден.");
              }
			 	             			  
              // Очищаем корзину и обновляем интерфейс
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

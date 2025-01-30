// Массив предметов, содержащий данные о каждом предмете, включая цену, описание и тип
const items = [
  // Покупаемые предметы
  {
    id: 1, // Уникальный идентификатор предмета
    name: "Склянка здоровья", // Название предмета
    description: "Восстанавливает 50 здоровья.", // Описание предмета
    type: "consumable", // Тип предмета (расходуемый)
    effect: { health: 150 }, // Эффект использования предмета
    price: 150, // Цена покупки предмета
	image: "assets/health_bottle.png" // Путь к картинке предмета с прозрачным фоном
  },
  {
    id: 2,
    name: "Склянка энергии",
    description: "Восстанавливает 50 энергии.",
    type: "consumable",
    effect: { energy: 50 },
    price: 200,
	image: "assets/energy_bottle.png" // Путь к картинке предмета с прозрачным фоном
  },
  {
    id: 3,
    name: "Золотая Склянка здоровья",
    description: "Восстанавливает 500 здоровья.",
    type: "consumable",
    effect: { health: 50000 },
    price: 500,
	image: "assets/golden_health_bottle.png" // Путь к картинке предмета с прозрачным фоном
  },
  // Лут с мобов (предметы, выпадающие после убийства мобов)
  {
    id: 101,
    name: "Древняя монета",
    description: "Используется для крафта или продажи.",
    type: "loot", // Тип предмета (добыча)
    sellPrice: 200,  // Цена продажи предмета
	image: "assets/ancient_coin.png" // Путь к картинке предмета с прозрачным фоном
  },
  {
    id: 102,
    name: "Кости",
    description: "Может быть продана за хорошие деньги.",
    type: "loot",
    sellPrice: 100,
	image: "assets/bones.png" // Путь к картинке предмета с прозрачным фоном
  },
  {
    id: 103,
    name: "Кусок Ткани",
    description: "Редкий ингредиент для зелий.",
    type: "loot",
    sellPrice: 50,
	image: "assets/scraps_cloth.png" // Путь к картинке предмета с прозрачным фоном
  },
  {
    id: 104,
    name: "Пыль Веков",
    description: "Редкий ингредиент для зелий.",
    type: "loot",
    sellPrice: 300,
	image: "assets/dust_centuries.png" // Путь к картинке предмета с прозрачным фоном
  }
];

// Функция для получения предмета по его уникальному идентификатору
function getItemById(itemId) {
  // Ищет предмет в массиве items и возвращает его, если найден. Если предмет не найден, возвращает null
  return items.find(item => item.id === itemId) || null;
}

// Функция для получения всех предметов определённого типа
function getItemsByType(type) {
  // Фильтрует массив items, возвращая только предметы с указанным типом
  return items.filter(item => item.type === type);
}

// Функция для получения цены предмета (покупной или продажной)
function getItemPrice(itemId) {
  // Находит предмет по идентификатору
  const item = getItemById(itemId);
  // Возвращает цену покупки (price) или продажную цену (sellPrice), если такие есть, иначе null
  return item ? item.price || item.sellPrice || null : null;
}

// Экспорт всех данных и функций модуля, чтобы они могли использоваться в других скриптах
export default {
  items, // Массив предметов
  getItemById, // Функция для получения предмета по ID
  getItemsByType, // Функция для получения предметов по типу
  getItemPrice // Функция для получения цены предмета
};

export const getItems = () => items;
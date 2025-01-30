import NicknameSystem from './nicknameSystem.js';

// Настройки опыта для каждого моба
const mobExperience = {
    goblin: 70,  // Моб с ID 1 дает 70 опыта
    Skeleton: 200, // Моб с ID 2 дает 200 опыта
    Guardianwarrior: 300,  // Моб с ID 3 дает 300 опыта
	Ghostknight: 500  // Моб с ID 4 дает 500 опыта
};

// Опыт, необходимый для повышения уровня
const EXP_PER_LEVEL = 1000;

// Функция добавления опыта
export function addExperience(nickname, amount) {
    const playerData = NicknameSystem.getPlayerData(nickname);
    if (!playerData) {
        console.error(`Игрок с никнеймом "${nickname}" не найден.`);
        return;
    }

    playerData.experience = (playerData.experience || 0) + amount;

    if (playerData.experience >= playerData.level * EXP_PER_LEVEL) {
        levelUp(nickname, playerData);
    } else {
        NicknameSystem.updatePlayerData(nickname, { experience: playerData.experience });
    }

    console.log(`Опыт игрока ${nickname}: ${playerData.experience}/${playerData.level * EXP_PER_LEVEL}`);
}

// Функция повышения уровня
function levelUp(nickname, playerData) {
    playerData.experience -= playerData.level * EXP_PER_LEVEL;
    playerData.level += 1;
    
    NicknameSystem.updatePlayerData(nickname, {
        level: playerData.level,
        experience: playerData.experience
    });

    console.log(`Поздравляем! ${nickname} повысил уровень до ${playerData.level}`);
}

// Начисление опыта за моба
export function gainExpFromMob(nickname, mobId) {
	console.log(`Попытка начислить опыт за моба: ${mobId}`);
	
    if (mobExperience[mobId]) {
        addExperience(nickname, mobExperience[mobId]);
		console.log(`Опыт добавлен: ${mobExperience[mobId]} за ${mobId}`);
    } else {
        console.warn(`Моб с ID ${mobId} не имеет опыта.`);
    }
}

// Получение текущего уровня и опыта
export function getExperienceInfo(nickname) {
    const playerData = NicknameSystem.getPlayerData(nickname);
    if (playerData) {
        return {
            level: playerData.level,
            experience: playerData.experience || 0,
            nextLevelExp: playerData.level * EXP_PER_LEVEL
        };
    }
    return null;
}

// src/mock/mockUtils.js
import db from "./db.json";

/**
 * Получить всех пользователей
 * @returns {Array} Массив пользователей
 */
export const getUsers = () => db.users;

/**
 * Получить пользователя по ID
 * @param {string} id - ID пользователя
 * @returns {Object|null} Пользователь или null, если не найден
 */
export const getUserById = (id) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(id)) && id.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c41e1",
      2: "67e01d299bf93367676c41e2",
      3: "67e01d299bf93367676c41e3",
      // Добавьте другие соответствия при необходимости
    };

    id = idMap[id] || id;
  }

  return db.users.find((user) => user._id === id) || null;
};

/**
 * Получить все группы
 * @returns {Array} Массив групп
 */
export const getGroups = () => db.groups;

/**
 * Получить группу по ID
 * @param {string} id - ID группы
 * @returns {Object|null} Группа или null, если не найдена
 */
export const getGroupById = (id) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(id)) && id.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c4201",
      2: "67e01d299bf93367676c4202",
      3: "67e01d299bf93367676c4203",
      // Добавьте другие соответствия при необходимости
    };

    id = idMap[id] || id;
  }

  return db.groups.find((group) => group._id === id) || null;
};

/**
 * Получить владельца группы
 * @param {Object} group - Объект группы
 * @returns {Object|null} Пользователь-владелец или null
 */
export const getGroupOwner = (group) => {
  if (!group || !group.ownerId) return null;
  return getUserById(group.ownerId);
};

/**
 * Получить участников группы
 * @param {string} groupId - ID группы
 * @returns {Array} Массив участников группы с данными о пользователях
 */
export const getGroupMembers = (groupId) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(groupId)) && groupId.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c4201",
      2: "67e01d299bf93367676c4202",
      3: "67e01d299bf93367676c4203",
      // Добавьте другие соответствия при необходимости
    };

    groupId = idMap[groupId] || groupId;
  }

  // Получаем членов группы
  const members = db.groupMembers.filter(
    (member) => member.groupId === groupId
  );

  // Добавляем данные о пользователях
  return members.map((member) => ({
    ...member,
    user: getUserById(member.userId),
  }));
};

/**
 * Получить бизнес по ID
 * @param {string} id - ID бизнеса
 * @returns {Object|null} Бизнес или null, если не найден
 */
export const getBusinessById = (id) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(id)) && id.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c41f1",
      2: "67e01d299bf93367676c41f2",
      3: "67e01d299bf93367676c41f3",
      // Добавьте другие соответствия при необходимости
    };

    id = idMap[id] || id;
  }

  return db.businesses.find((business) => business._id === id) || null;
};

/**
 * Проверить, является ли ID ObjectId MongoDB
 * @param {string} id - ID для проверки
 * @returns {boolean} true, если ID похож на ObjectId
 */
export const isObjectId = (id) => {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Получить категорию по ID
 * @param {string} id - ID категории
 * @returns {Object|null} Категория или null, если не найдена
 */
export const getCategoryById = (id) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(id)) && id.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c4101",
      2: "67e01d299bf93367676c4102",
      3: "67e01d299bf93367676c4103",
      4: "67e01d299bf93367676c4104",
      5: "67e01d299bf93367676c4105",
      // Добавьте другие соответствия при необходимости
    };

    id = idMap[id] || id;
  }

  return db.categories.find((category) => category._id === id) || null;
};

/**
 * Получить беседу по ID
 * @param {string} id - ID беседы
 * @returns {Object|null} Беседа или null, если не найдена
 */
export const getConversationById = (id) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(id)) && id.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c4401",
      2: "67e01d299bf93367676c4402",
      3: "67e01d299bf93367676c4403",
      // Добавьте другие соответствия при необходимости
    };

    id = idMap[id] || id;
  }

  const conversation = db.conversations.find((conv) => conv._id === id);

  if (!conversation) return null;

  // Добавляем данные об участниках
  const populatedConversation = {
    ...conversation,
    participants: conversation.participants.map((participantId) =>
      getUserById(participantId)
    ),
  };

  return populatedConversation;
};

/**
 * Получить сообщения беседы
 * @param {string} conversationId - ID беседы
 * @returns {Array} Массив сообщений с данными об отправителях
 */
export const getMessagesByConversationId = (conversationId) => {
  // Если это числовой ID из старой версии приложения
  if (!isNaN(parseInt(conversationId)) && conversationId.length < 10) {
    // Преобразуем числовой ID в MongoDB ObjectId из нашего маппинга
    const idMap = {
      1: "67e01d299bf93367676c4401",
      2: "67e01d299bf93367676c4402",
      3: "67e01d299bf93367676c4403",
      // Добавьте другие соответствия при необходимости
    };

    conversationId = idMap[conversationId] || conversationId;
  }

  // Получаем сообщения
  const messages = db.messages.filter(
    (message) => message.conversationId === conversationId
  );

  // Добавляем данные об отправителях
  return messages.map((message) => ({
    ...message,
    sender: getUserById(message.senderId),
  }));
};

export default {
  getUsers,
  getUserById,
  getGroups,
  getGroupById,
  getGroupOwner,
  getGroupMembers,
  getBusinessById,
  isObjectId,
  getCategoryById,
  getConversationById,
  getMessagesByConversationId,
};

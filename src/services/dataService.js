// src/services/dataService.js
import api from "./api";
import mockUtils from "@/mock/mockUtils";

// Определение режима работы
const useMockData = process.env.VUE_APP_USE_MOCK_DATA === "true" || true; // По умолчанию используем моки

/**
 * Сервис для работы с данными приложения (как моковыми, так и реальными)
 */
const dataService = {
  /**
   * Получить пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async getUserById(id) {
    try {
      // Проверяем режим работы
      if (useMockData) {
        const user = mockUtils.getUserById(id);
        return Promise.resolve(user);
      }

      // Реальный API запрос
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  /**
   * Получить группу по ID
   * @param {string} id - ID группы
   * @returns {Promise<Object>} Группа
   */
  async getGroupById(id) {
    try {
      if (useMockData) {
        const group = mockUtils.getGroupById(id);
        return Promise.resolve(group);
      }

      const response = await api.get(`/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting group:", error);
      throw error;
    }
  },

  /**
   * Получить владельца группы
   * @param {Object|string} group - Объект группы или ID группы
   * @returns {Promise<Object>} Пользователь-владелец
   */
  async getGroupOwner(group) {
    try {
      if (typeof group === "string") {
        // Если передан ID группы, сначала получаем группу
        group = await this.getGroupById(group);
      }

      if (!group || !group.ownerId) {
        throw new Error("Group or owner ID not found");
      }

      if (useMockData) {
        const owner = mockUtils.getGroupOwner(group);
        return Promise.resolve(owner);
      }

      const response = await api.get(`/users/${group.ownerId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting group owner:", error);
      throw error;
    }
  },

  /**
   * Получить участников группы
   * @param {string} groupId - ID группы
   * @returns {Promise<Array>} Массив участников группы
   */
  async getGroupMembers(groupId) {
    try {
      if (useMockData) {
        const members = mockUtils.getGroupMembers(groupId);
        return Promise.resolve(members);
      }

      const response = await api.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error("Error getting group members:", error);
      throw error;
    }
  },

  /**
   * Получить бизнес по ID
   * @param {string} id - ID бизнеса
   * @returns {Promise<Object>} Бизнес
   */
  async getBusinessById(id) {
    try {
      if (useMockData) {
        const business = mockUtils.getBusinessById(id);
        return Promise.resolve(business);
      }

      const response = await api.get(`/businesses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting business:", error);
      throw error;
    }
  },

  /**
   * Создать беседу с пользователем
   * @param {Object} data - Данные для создания беседы
   * @param {string} data.recipientId - ID получателя
   * @param {string} data.initialMessage - Начальное сообщение
   * @param {string} [data.groupId] - ID группы (опционально)
   * @returns {Promise<Object>} Созданная беседа
   */
  async createConversation(data) {
    try {
      // Для моковых данных просто имитируем создание беседы
      if (useMockData) {
        // Преобразуем числовые ID в ObjectId, если нужно
        const recipientId = mockUtils.isObjectId(data.recipientId)
          ? data.recipientId
          : mockUtils.getUserById(data.recipientId)?._id;

        const currentUserId = "67e01d299bf93367676c41e1"; // ID текущего пользователя в моках

        // Создаем простую имитацию ответа API
        const mockConversation = {
          _id:
            "67e39812e1a57def37aa" +
            Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0"),
          participants: [
            mockUtils.getUserById(currentUserId),
            mockUtils.getUserById(recipientId),
          ],
          lastMessage: {
            text: data.initialMessage,
            senderId: currentUserId,
            createdAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (data.groupId) {
          mockConversation.groupId = data.groupId;
        }

        return Promise.resolve(mockConversation);
      }

      // Реальный API запрос
      const response = await api.post("/messages/conversation", data);
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  /**
   * Получить беседы пользователя
   * @returns {Promise<Array>} Массив бесед
   */
  async getConversations() {
    try {
      if (useMockData) {
        // Имитация получения бесед текущего пользователя
        const currentUserId = "67e01d299bf93367676c41e1"; // ID текущего пользователя в моках

        // Получаем все беседы, где есть текущий пользователь
        const conversations = mockUtils
          .getConversations()
          .filter((conversation) =>
            conversation.participants.includes(currentUserId)
          );

        // Наполняем данные о пользователях
        const populatedConversations = conversations.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((participantId) =>
            mockUtils.getUserById(participantId)
          ),
        }));

        return Promise.resolve(populatedConversations);
      }

      const response = await api.get("/messages/conversations");
      return response.data;
    } catch (error) {
      console.error("Error getting conversations:", error);
      throw error;
    }
  },

  /**
   * Получить сообщения беседы
   * @param {string} conversationId - ID беседы
   * @returns {Promise<Array>} Массив сообщений
   */
  async getMessages(conversationId) {
    try {
      if (useMockData) {
        const messages = mockUtils.getMessagesByConversationId(conversationId);
        return Promise.resolve(messages);
      }

      const response = await api.get(
        `/messages/conversation/${conversationId}/messages`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  },
};

export default dataService;

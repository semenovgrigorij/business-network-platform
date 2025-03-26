// store/modules/messages.js

import api from "@/services/api";

const state = {
  conversations: [],
  currentConversation: null,
  currentMessages: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const getters = {
  conversations: (state) => state.conversations || [],
  currentConversation: (state) => state.currentConversation,
  currentMessages: (state) => state.currentMessages,
  unreadCount: (state) => state.unreadCount || 0,
  loading: (state) => state.loading,
  error: (state) => state.error,
  getConversationById: (state) => (id) => {
    return state.conversations.find(
      (conv) => conv.id === id || conv._id === id
    );
  },
  conversationMessages: (state) => {
    return state.currentMessages || [];
  },
};

const actions = {
  // Получение списка бесед
  async fetchConversations({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      const response = await api.get("/messages/conversations");
      commit("SET_CONVERSATIONS", response.data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении бесед:", error);

      // Если ошибка не связана с авторизацией (401), устанавливаем ее в state
      if (!error.response || error.response.status !== 401) {
        commit("SET_ERROR", error.message || "Ошибка при загрузке бесед");
      }

      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  // Получение количества непрочитанных сообщений
  async fetchUnreadCount({ commit }) {
    try {
      // Проверяем, авторизован ли пользователь, перед отправкой запроса
      const isAuthenticated = this.getters["auth/isAuthenticated"];
      if (!isAuthenticated) {
        console.log(
          "Пользователь не авторизован, пропускаем запрос непрочитанных сообщений"
        );
        commit("SET_UNREAD_COUNT", 0);
        return 0;
      }

      const response = await api.get("/messages/unread-count");
      commit("SET_UNREAD_COUNT", response.data.count);
      return response.data.count;
    } catch (error) {
      console.error(
        "Ошибка при получении количества непрочитанных сообщений:",
        error
      );

      // Если это ошибка авторизации, устанавливаем счетчик в 0
      if (error.response && error.response.status === 401) {
        commit("SET_UNREAD_COUNT", 0);
      }

      // Не устанавливаем ошибку, чтобы не нарушать работу других частей приложения
      return 0;
    }
  },

  // Создание новой беседы
  async createConversation(_, payload) {
    try {
      console.log("Store: Создание беседы с параметрами:", payload);

      // Проверяем наличие обязательных полей
      if (!payload.recipientId) {
        throw new Error("ID получателя обязателен");
      }

      if (!payload.initialMessage) {
        throw new Error("Начальное сообщение обязательно");
      }

      // Формируем запрос с корректными данными
      const data = {
        recipientId: String(payload.recipientId),
        initialMessage: payload.initialMessage,
      };

      // Если есть groupId, добавляем его в запрос
      if (payload.groupId) {
        data.groupId = String(payload.groupId);
      }

      console.log(
        "Store: Отправляем запрос на /api/messages/conversation с данными:",
        data
      );

      // Используем импортированный API клиент вместо this._vm.$api
      const response = await api.post("/messages/conversation", data);

      console.log("Store: Ответ сервера:", response.data);

      // Если успешно, возвращаем данные о созданной беседе
      return response.data;
    } catch (error) {
      console.error("Store: Error creating conversation:", error);

      // Выводим детальную информацию об ошибке
      if (error.response) {
        console.error("Store: Response status:", error.response.status);
        console.error("Store: Response data:", error.response.data);
      }

      throw error;
    }
  },

  async fetchConversationById({ commit, rootGetters }, conversationId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      console.log("Fetching conversation by ID:", conversationId);

      const response = await api.get(
        `/messages/conversation/${conversationId}`
      );
      const conversation = response.data;

      // Проверяем структуру данных и адаптируем если нужно
      if (!conversation.participants) {
        // Создаем массив участников, если его нет
        const currentUser = rootGetters["auth/currentUser"];
        const participants = [];

        // Если есть данные о получателе, добавляем его в участники
        if (conversation.recipient) {
          participants.push({
            id: conversation.recipient.id,
            firstName: conversation.recipient.firstName,
            lastName: conversation.recipient.lastName,
          });
        }

        // Добавляем текущего пользователя, если возможно
        if (currentUser) {
          participants.push({
            id: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          });
        }

        conversation.participants = participants;
      }

      commit("SET_CURRENT_CONVERSATION", conversation);
      return conversation;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      commit("SET_ERROR", error.message || "Ошибка при загрузке беседы");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchMessages({ commit, rootGetters }, conversationId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      console.log("Fetching messages for conversation:", conversationId);

      const response = await api.get(
        `/messages/conversation/${conversationId}/messages`
      );
      const messages = response.data;

      // Получаем ID текущего пользователя
      const currentUser = rootGetters["auth/currentUser"];

      // Адаптируем формат сообщений, если необходимо
      const adaptedMessages = messages.map((msg) => {
        // Если senderId - это строка, преобразуем в объект для совместимости
        if (typeof msg.senderId === "string") {
          return {
            ...msg,
            senderId: {
              id: msg.senderId,
              // Добавляем флаг, если это текущий пользователь
              isCurrentUser: currentUser && msg.senderId === currentUser.id,
            },
          };
        }
        return msg;
      });

      commit("SET_CURRENT_MESSAGES", adaptedMessages);
      return adaptedMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);

      // Создаем мок-сообщения для разработки при ошибке
      const currentUser = rootGetters["auth/currentUser"];
      const mockMessages = [
        {
          id: "msg1",
          conversationId: conversationId,
          senderId: "recipient-123",
          text: "Привіт! Чим я можу допомогти?",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];

      if (currentUser) {
        mockMessages.push({
          id: "msg2",
          conversationId: conversationId,
          senderId: currentUser.id,
          text: "Мене цікавить інформація про бізнес",
          createdAt: new Date().toISOString(),
        });
      }

      commit("SET_CURRENT_MESSAGES", mockMessages);
      commit("SET_ERROR", error.message || "Ошибка при загрузке сообщений");
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async sendMessage({ commit, rootGetters }, { conversationId, text }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      console.log("Sending message to conversation:", conversationId, text);

      const response = await api.post(
        `/messages/conversation/${conversationId}/message`,
        { text }
      );
      commit("ADD_MESSAGE", response.data);

      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);

      // Для разработки - создаем мок-ответ
      const currentUser = rootGetters["auth/currentUser"];

      if (currentUser) {
        const mockMessage = {
          id: "msg-" + Date.now(),
          conversationId: conversationId,
          senderId: currentUser.id,
          text: text,
          createdAt: new Date().toISOString(),
          read: false,
        };

        commit("ADD_MESSAGE", mockMessage);
        return mockMessage;
      }

      commit("SET_ERROR", error.message || "Ошибка при отправке сообщения");
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  async fetchConversationMessages({ commit }, conversationId) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);

    try {
      console.log("Fetching conversation messages for ID:", conversationId);
      const response = await api.get(
        `/messages/conversation/${conversationId}/messages`
      );
      commit("SET_CURRENT_MESSAGES", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      commit(
        "SET_ERROR",
        error.message || "Ошибка при загрузке сообщений беседы"
      );
      throw error;
    } finally {
      commit("SET_LOADING", false);
    }
  },

  setCurrentConversation({ commit }, conversation) {
    commit("SET_CURRENT_CONVERSATION", conversation);
  },

  // Другие действия...
};

const mutations = {
  SET_CONVERSATIONS(state, conversations) {
    state.conversations = conversations;
  },
  SET_CURRENT_CONVERSATION(state, conversation) {
    state.currentConversation = conversation;
  },
  SET_CURRENT_MESSAGES(state, messages) {
    state.currentMessages = messages;
  },
  ADD_CONVERSATION(state, conversation) {
    // Проверяем, существует ли уже беседа с таким ID
    const exists = state.conversations.some((c) => c.id === conversation.id);
    if (!exists) {
      state.conversations.unshift(conversation);
    }
  },
  ADD_MESSAGE(state, message) {
    state.currentMessages.push(message);
  },
  SET_UNREAD_COUNT(state, count) {
    state.unreadCount = count;
  },
  INCREMENT_UNREAD_COUNT(state) {
    state.unreadCount++;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

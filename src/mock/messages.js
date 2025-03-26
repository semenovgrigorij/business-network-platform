export const mockConversations = [
  {
    id: "1",
    contact: {
      id: "2",
      name: "ЕкоФерма",
      avatar: null,
      company: "Органічні продукти харчування",
      email: "contact@ecofarm.ru",
      phone: "+38(050) 234-56-78",
    },
    lastMessage: {
      id: "101",
      text: "Доброго дня! Дякую за інтерес. Яку саме співпрацю ви пропонуєте?",
      senderId: "2",
      timestamp: "2025-03-10T09:30:00Z",
    },
    unreadCount: 1,
  },
  // Другие беседы...
];

const mockMessages = {
  1: [
    {
      id: "1",
      senderId: "1",
      text: "Привіт! Зацікавлений у співпраці з компанією.",
      timestamp: "2025-03-10T08:45:00Z",
      read: true,
    },
    {
      id: "2",
      senderId: "2",
      text: "Доброго дня! Дякую за інтерес. Яку саме співпрацю ви пропонуєте?",
      timestamp: "2025-03-10T09:30:00Z",
      read: false,
    },
  ],
  // Сообщения для других бесед...
};

// Функции для эмуляции API
export const mockApi = {
  getConversations() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockConversations), 500);
    });
  },

  getMessages(conversationId) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMessages[conversationId] || []), 500);
    });
  },

  sendMessage(conversationId, content) {
    return new Promise((resolve) => {
      const newMessage = {
        id: `new-${Date.now()}`,
        senderId: "1", // Текущий пользователь
        text: content,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Добавляем сообщение в мок-данные
      if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = [];
      }
      mockMessages[conversationId].push(newMessage);

      setTimeout(() => resolve(newMessage), 500);
    });
  },

  // Добавьте другие методы по необходимости
  createConversation(recipientId, initialMessage) {
    console.log("Creating conversation with:", recipientId, initialMessage);

    // Проверяем, что recipientId это не объект контекста Vuex
    if (typeof recipientId === "object" && recipientId !== null) {
      // Если это объект, извлекаем нужные данные
      const params = recipientId;
      recipientId = params.recipientId;
      initialMessage = params.initialMessage;

      console.log("Extracted recipient ID:", recipientId);
      console.log("Extracted message:", initialMessage);
    }

    return new Promise((resolve) => {
      // Генерируем новый идентификатор беседы
      const newConversationId = `conv-${Date.now()}`;

      // Получаем данные получателя
      const recipient = this.getMockUserById(recipientId);
      console.log("Recipient data:", recipient);

      // Создаем новую беседу
      const newConversation = {
        id: newConversationId,
        contact: recipient,
        lastMessage: initialMessage
          ? {
              id: `msg-${Date.now()}`,
              text: initialMessage,
              senderId: "1", // ID текущего пользователя
              timestamp: new Date().toISOString(),
            }
          : null,
        unreadCount: 0,
      };

      // Добавляем её в массив бесед
      mockConversations.unshift(newConversation);

      // Если есть начальное сообщение, создаем новую запись в сообщениях
      if (initialMessage) {
        const message = {
          id: `msg-${Date.now()}`,
          senderId: "1", // ID текущего пользователя
          text: initialMessage,
          timestamp: new Date().toISOString(),
          read: false,
        };

        mockMessages[newConversationId] = [message];
      } else {
        mockMessages[newConversationId] = [];
      }

      console.log("New conversation complete:", newConversation);
      setTimeout(() => resolve(newConversation), 500);
    });
  },

  // Вспомогательный метод для получения пользователя по ID
  getMockUserById(userId) {
    console.log("Getting mock user by ID:", userId);

    // Дополнительные моковые пользователи для разных сценариев
    const mockUsers = {
      2: {
        id: "2",
        name: "ЕкоФерма",
        avatar: null,
        company: "Органічні продукти харчування",
        email: "contact@ecofarm.ru",
        phone: "+38(050) 234-56-78",
      },
      3: {
        id: "3",
        name: "Буд-Майстер",
        avatar: null,
        company: "Будівництво та ремонт",
        email: "info@stroymaster.ua",
        phone: "+38 (099) 345-67-89",
      },
      // Добавляем больше пользователей для разных типов объектов
      user_1: {
        id: "user_1",
        name: "Олександр Петренко",
        avatar: null,
        jobTitle: "CEO, Tech Solutions",
        company: "Tech Solutions",
        email: "alex@example.com",
        phone: "+38 (050) 123-45-67",
      },
      business_1: {
        id: "business_1",
        name: "IT-фахівці",
        avatar: null,
        company: "IT компанія",
        email: "contact@it-group.com",
        phone: "+38 (044) 123-45-67",
      },
      group_1: {
        id: "group_1",
        name: "Спільнота розробників",
        avatar: null,
        description: "Група для обговорення питань розробки",
        email: "community@dev.com",
      },
    };

    // Преобразуем userId в строку для безопасного сравнения
    const userIdStr = String(userId);

    // Проверяем, существует ли пользователь с таким ID
    if (mockUsers[userIdStr]) {
      console.log("Found user in mock data:", mockUsers[userIdStr]);
      return mockUsers[userIdStr];
    }

    // Если не найден, создаем базовый объект
    console.log(
      "User not found in mock data, creating default for ID:",
      userIdStr
    );
    return {
      id: userIdStr,
      name: `Користувач ${userIdStr}`,
      avatar: null,
      company: `Компанія ${userIdStr}`,
      email: `user${userIdStr}@example.com`,
      phone: "+38 (000) 000-00-00",
    };
  },

  getConversationById(id) {
    console.log("Getting conversation by ID in mock API:", id);

    return new Promise((resolve) => {
      // Поиск в существующих беседах
      const conversation = mockConversations.find((conv) => conv.id === id);

      if (conversation) {
        console.log("Found conversation in mock data:", conversation);
        setTimeout(() => resolve(conversation), 300);
      } else {
        console.log("Conversation not found in mocks:", id);
        // Если это динамически созданная беседа (начинается с "conv-")
        if (id.startsWith("conv-")) {
          // Поиск с использованием строгого сравнения строк
          const convByString = mockConversations.find(
            (c) => String(c.id) === String(id)
          );
          if (convByString) {
            console.log("Found by string conversion:", convByString);
            setTimeout(() => resolve(convByString), 300);
            return;
          }
        }
        setTimeout(() => resolve(null), 300);
      }
    });
  },
};

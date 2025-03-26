// backend/routes/messages.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// В начале файла messages.js
console.log("Loading message routes...");
// Выведите все маршруты
console.log(
  "Registered routes:",
  router.stack.map((r) => ({
    path: r.route?.path,
    methods: r.route?.methods,
  }))
);

// @route   GET api/messages/conversations
// @desc    Получить все беседы пользователя
// @access  Private
router.get("/conversations", auth, async (req, res) => {
  try {
    // Найти все беседы, в которых участвует пользователь
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "firstName lastName avatar")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Помилка сервера при отриманні бесід" });
  }
});

// @route   GET api/messages/conversation/:id
// @desc    Получить сообщения беседы по ID
// @access  Private
router.get("/conversation/:id", auth, async (req, res) => {
  try {
    // Проверить, что пользователь является участником беседы
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Бесіда не знайдена" });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Получить сообщения беседы
    const messages = await Message.find({ conversationId: req.params.id })
      .populate("senderId", "firstName lastName avatar")
      .sort({ createdAt: 1 });

    // Отметить непрочитанные сообщения как прочитанные
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user.id },
        read: false,
      },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні повідомлень" });
  }
});

// @route   POST api/messages/conversation
// @desc    Создать новую беседу или найти существующую
// @access  Private
router.post("/conversation", auth, async (req, res) => {
  try {
    console.log("Создание беседы. Тело запроса:", req.body);
    console.log("Пользователь:", req.user);

    const { recipientId, initialMessage, groupId } = req.body;

    // Проверяем наличие необходимых полей
    if (!recipientId) {
      return res.status(400).json({
        message: "ID получателя обязателен",
        details: "Для создания беседы необходимо указать recipientId",
      });
    }

    // Убедитесь, что recipientId является строкой
    if (typeof recipientId !== "string") {
      return res.status(400).json({
        message: "Некорректний формат recipientId",
        details: `Получен тип: ${typeof recipientId}`,
      });
    }

    console.log(`Попытка найти пользователя по ID: ${recipientId}`);
    const recipient = await User.findById(recipientId);
    console.log(`Результат поиска пользователя:`, recipient);

    if (!recipient) {
      return res.status(404).json({
        message: "Користувач не знайдений",
        details: `Пользователь с ID ${recipientId} не найден`,
      });
    }

    if (recipientId === req.user.id) {
      return res
        .status(400)
        .json({ message: "Неможливо почати бесіду з самим собою" });
    }

    // Проверяем существует ли уже беседа
    let conversationQuery = {
      participants: { $all: [req.user.id, recipientId] },
    };

    // Если есть groupId, добавляем его в запрос
    if (groupId) {
      conversationQuery.groupId = groupId;
    }

    console.log("Поиск беседы по параметрам:", conversationQuery);

    let conversation = await Conversation.findOne(conversationQuery).populate(
      "participants",
      "firstName lastName avatar"
    );

    if (!conversation) {
      console.log("Беседа не найдена, создаем новую");
      // Создаем объект беседы
      const newConversation = {
        participants: [req.user.id, recipientId],
        updatedAt: new Date(),
      };

      // Если есть groupId, добавляем его
      if (groupId) {
        newConversation.groupId = groupId;
      }

      // Если есть initialMessage, добавляем последнее сообщение
      if (initialMessage) {
        newConversation.lastMessage = {
          text: initialMessage,
          senderId: req.user.id,
          createdAt: new Date(),
        };
      }

      conversation = new Conversation(newConversation);
      await conversation.save();

      console.log("Новая беседа создана с ID:", conversation._id);

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "firstName lastName avatar"
      );
    } else {
      console.log("Найдена существующая беседа:", conversation._id);
    }

    // Если есть начальное сообщение, создаем его
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation._id,
        senderId: req.user.id,
        text: initialMessage,
        createdAt: new Date(),
      });

      await message.save();
      console.log("Создано сообщение с ID:", message._id);

      // Обновляем последнее сообщение в беседе
      conversation.lastMessage = {
        text: initialMessage,
        senderId: req.user.id,
        createdAt: new Date(),
      };
      conversation.updatedAt = new Date();

      await conversation.save();
    }

    console.log("Возвращаем беседу:", conversation);
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      message: "Помилка сервера при створенні бесіди",
      details: error.message,
    });
  }
});

// @route   POST api/messages
// @desc    Отправить сообщение
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ message: "Всі поля обов'язкові" });
    }

    // Проверяем существование беседы
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Бесіда не знайдена" });
    }

    // Проверяем, что пользователь участвует в беседе
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Создаем сообщение
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      text,
      createdAt: new Date(),
    });

    await message.save();

    // Обновляем последнее сообщение в беседе
    conversation.lastMessage = {
      text,
      senderId: req.user.id,
      createdAt: new Date(),
    };
    conversation.updatedAt = new Date();

    await conversation.save();

    // Получаем данные отправителя
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "firstName lastName avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при відправленні повідомлення" });
  }
});

// @route   GET api/messages/unread-count
// @desc    Получить количество непрочитанных сообщений
// @access  Private
router.get("/unread-count", auth, async (req, res) => {
  try {
    // Найти все беседы, в которых участвует пользователь
    const conversations = await Conversation.find({
      participants: req.user.id,
    });

    // Подсчитать количество непрочитанных сообщений
    let unreadCount = 0;
    for (const conversation of conversations) {
      if (
        conversation.lastMessage &&
        conversation.lastMessage.senderId !== req.user.id &&
        !conversation.lastMessage.read
      ) {
        unreadCount++;
      }
    }

    res.json({ count: unreadCount });
  } catch (error) {
    console.error(
      "Ошибка при получении количества непрочитанных сообщений:",
      error
    );
    res.status(500).json({
      message:
        "Помилка сервера при отриманні кількості непрочитаних повідомлень",
    });
  }
});

// @route   POST api/messages/conversation/:id/message
// @desc    Отправить сообщение в конкретную беседу
// @access  Private
router.post("/conversation/:id/message", auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Текст повідомлення обов'язковий" });
    }

    // Проверяем существование беседы
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Бесіда не знайдена" });
    }

    // Проверяем, что пользователь участвует в беседе
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Создаем сообщение
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      text,
      createdAt: new Date(),
    });

    await message.save();

    // Обновляем последнее сообщение в беседе
    conversation.lastMessage = {
      text,
      senderId: req.user.id,
      createdAt: new Date(),
    };
    conversation.updatedAt = new Date();

    await conversation.save();

    // Получаем данные отправителя
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "firstName lastName avatar"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при відправленні повідомлення" });
  }
});

// @route   GET api/messages/conversation/:id/messages
// @desc    Получить сообщения беседы по ID
// @access  Private
router.get("/conversation/:id/messages", auth, async (req, res) => {
  try {
    // Проверить, что пользователь является участником беседы
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Бесіда не знайдена" });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Доступ заборонено" });
    }

    // Получить сообщения беседы
    const messages = await Message.find({ conversationId: req.params.id })
      .populate("senderId", "firstName lastName avatar")
      .sort({ createdAt: 1 });

    // Отметить непрочитанные сообщения как прочитанные
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user.id },
        read: false,
      },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні повідомлень" });
  }
});

module.exports = router;

// backend/controllers/messageController.js
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// Получение всех бесед пользователя
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Предполагается, что middleware auth устанавливает req.user

    // Находим беседы, где пользователь является участником
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "firstName lastName avatar",
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Получение конкретной беседы по ID
exports.getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId).populate({
      path: "participants",
      select: "firstName lastName avatar",
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Проверяем, является ли пользователь участником беседы
    if (!conversation.participants.some((p) => p.id === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Получение сообщений беседы
exports.getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Проверяем, что беседа существует и пользователь имеет к ней доступ
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Получаем сообщения и сортируем по времени создания
    const messages = await Message.find({ conversationId })
      .populate({
        path: "senderId",
        select: "firstName lastName avatar",
      })
      .sort({ createdAt: 1 });

    // Отмечаем непрочитанные сообщения как прочитанные
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        read: false,
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Создание новой беседы
exports.createConversation = async (req, res) => {
  try {
    const { recipientId, initialMessage } = req.body;
    const userId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }

    // Проверяем, существует ли получатель
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Проверяем, существует ли уже беседа между этими пользователями
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    // Если беседы нет, создаем новую
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId],
      });
      await conversation.save();
    }

    // Если есть начальное сообщение, добавляем его
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation.id,
        senderId: userId,
        text: initialMessage,
      });
      await message.save();

      // Обновляем lastMessage в беседе
      conversation.lastMessage = {
        text: initialMessage,
        senderId: userId,
        createdAt: new Date(),
      };
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    // Получаем данные для ответа клиенту
    const fullConversation = await Conversation.findById(
      conversation.id
    ).populate({
      path: "participants",
      select: "firstName lastName avatar",
    });

    res.status(201).json(fullConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Отправка сообщения
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.id;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Проверяем, что беседа существует и пользователь имеет к ней доступ
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Создаем новое сообщение
    const message = new Message({
      conversationId,
      senderId: userId,
      text,
    });
    await message.save();

    // Обновляем lastMessage в беседе
    conversation.lastMessage = {
      text,
      senderId: userId,
      createdAt: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    // Получаем полные данные о сообщении
    const fullMessage = await Message.findById(message.id).populate({
      path: "senderId",
      select: "firstName lastName avatar",
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

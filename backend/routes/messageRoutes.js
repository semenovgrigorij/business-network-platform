// backend/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Получение всех бесед пользователя
router.get("/conversations", auth, messageController.getConversations);

// Получение конкретной беседы
router.get("/conversation/:id", auth, messageController.getConversationById);

// Получение сообщений беседы
router.get(
  "/conversation/:id/messages",
  auth,
  messageController.getConversationMessages
);

// Создание новой беседы
router.post("/conversation", auth, messageController.createConversation);

// Отправка сообщения
router.post("/conversation/:id/message", auth, messageController.sendMessage);

module.exports = router;

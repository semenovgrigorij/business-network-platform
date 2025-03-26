const jsonServer = require("json-server");
const path = require("path");
const fs = require("fs");
const multer = require("multer"); // Для обработки multipart/form-data
const server = jsonServer.create();
const router = jsonServer.router("./mock/db.json");
const middlewares = jsonServer.defaults();
const routes = require("./mock/routes.json");

server.use(middlewares);
server.use(jsonServer.rewriter(routes)); // Важно использовать rewriter с вашими маршрутами
server.use(router);

// Настройка хранилища для загруженных файлов
const uploadDir = path.join(__dirname, "uploads");

// Создаем директорию, если она не существует
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Создаем уникальное имя файла
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

// Используем стандартные middleware (logger, static, cors и т.д.)
server.use(middlewares);

// Разбор тела запроса
server.use(jsonServer.bodyParser);

// Статический доступ к загруженным файлам
server.use(
  "/uploads",
  jsonServer.defaults({ static: path.join(__dirname, "uploads") })
);

// Обработка загрузки изображений
server.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }

    // Формируем URL для доступа к изображению
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      imageUrl,
      message: "Файл успешно загружен",
    });
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    res.status(500).json({ message: "Ошибка при загрузке файла" });
  }
});

// Добавляем кастомные маршруты перед роутером json-server
server.post("/api/auth/login", (req, res) => {
  const { email } = req.body;

  // В реальном приложении здесь бы была проверка пароля
  // Для демо используем простую логику: находим пользователя по email
  const users = router.db.get("users").value();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  // Находим существующий токен или создаем новый
  const tokens = router.db.get("auth.tokens").value();
  let token = tokens.find((t) => t.userId === user.id);

  if (!token) {
    // В реальном приложении здесь бы был код для генерации JWT
    token = {
      id: tokens.length + 1,
      userId: user.id,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6JHt1c2VyLmlkfX0.example-token-${user.id}`,
    };

    router.db.get("auth.tokens").push(token).write();
  }

  // Возвращаем токен и данные пользователя (без пароля, если он есть в объекте)
  const userWithoutPassword = { ...user };

  res.json({
    token: token.token,
    user: userWithoutPassword,
  });
});

// Регистрация нового пользователя
server.post("/api/auth/register", (req, res) => {
  const { email, firstName, lastName, ...userData } = req.body;

  // Проверяем, существует ли уже пользователь с таким email
  const users = router.db.get("users").value();
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Пользователь с таким email уже существует" });
  }

  // Создаем нового пользователя
  const newUser = {
    id: users.length + 1,
    email,
    firstName,
    lastName,
    ...userData,
    createdAt: new Date().toISOString(),
  };

  // Добавляем пользователя в базу
  router.db.get("users").push(newUser).write();

  // Создаем токен для нового пользователя
  const token = {
    id: router.db.get("auth.tokens").value().length + 1,
    userId: newUser.id,
    token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6JHtuZXdVc2VyLmlkfX0.example-token-${newUser.id}`,
  };

  router.db.get("auth.tokens").push(token).write();

  // Возвращаем токен и данные пользователя
  const userWithoutPassword = { ...newUser };

  res.status(201).json({
    token: token.token,
    user: userWithoutPassword,
  });
});

// Промежуточный обработчик для проверки авторизации
server.use((req, res, next) => {
  // Проверяем только для некоторых маршрутов
  const protectedPaths = [
    "/api/users/profile",
    "/api/conversations",
    "/api/messages",
  ];

  const isProtected = protectedPaths.some(
    (path) => req.path.startsWith(path) || req.path.includes("/members")
  );

  if (!isProtected) {
    return next();
  }

  // Получаем токен из заголовка
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const token = authHeader.replace("Bearer ", "");
  const tokens = router.db.get("auth.tokens").value();
  const foundToken = tokens.find((t) => t.token === token);

  if (!foundToken) {
    return res.status(401).json({ message: "Неверный или устаревший токен" });
  }

  // Добавляем пользователя в запрос
  req.user = router.db.get("users").find({ id: foundToken.userId }).value();

  next();
});

// Считаем количество непрочитанных сообщений
server.get("/api/messages/unread/count", (req, res) => {
  const userId = req.user.id;

  // Находим все беседы, в которых участвует пользователь
  const conversations = router.db
    .get("conversations")
    .filter((conv) => conv.participants.includes(userId))
    .value();

  // ID бесед пользователя
  const conversationIds = conversations.map((conv) => conv.id);

  // Считаем непрочитанные сообщения для этого пользователя
  const count = router.db
    .get("messages")
    .filter(
      (msg) =>
        conversationIds.includes(msg.conversationId) &&
        msg.senderId !== userId &&
        !msg.read
    )
    .size()
    .value();

  res.json({ count });
});

// Маркировка сообщений как прочитанных
server.post("/api/messages/read", (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.id;

  // Проверяем, что сообщения адресованы текущему пользователю
  const messages = router.db
    .get("messages")
    .filter((msg) => messageIds.includes(msg.id))
    .value();

  // Находим беседы этих сообщений
  const conversationIds = [
    ...new Set(messages.map((msg) => msg.conversationId)),
  ];

  // Проверяем, что пользователь участвует в этих беседах
  const conversations = router.db
    .get("conversations")
    .filter((conv) => conversationIds.includes(conv.id))
    .value();

  const isParticipant = conversations.every((conv) =>
    conv.participants.includes(userId)
  );

  if (!isParticipant) {
    return res.status(403).json({ message: "Доступ запрещен" });
  }

  // Помечаем сообщения как прочитанные
  router.db
    .get("messages")
    .filter((msg) => messageIds.includes(msg.id))
    .each((msg) => {
      msg.read = true;
    })
    .write();

  res.json({ success: true });
});

// Используем маршруты из routes.json
server.use(jsonServer.rewriter(require("./routes.json")));

// Используем роутер JSON Server
server.use(router);

// Запускаем сервер
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server запущен на http://localhost:${PORT}`);
});

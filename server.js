const jsonServer = require("json-server");
const server = jsonServer.create();
const path = require("path");
const router = jsonServer.router(path.join(__dirname, "mock/db.json"));
const middlewares = jsonServer.defaults();

// Добавляем middleware для обработки маршрутов API
server.use((req, res, next) => {
  // Обрабатываем запросы /api/businesses/:id -> /businesses/:id
  if (req.url.match(/^\/api\/businesses\/\d+$/)) {
    const id = req.url.split("/").pop();
    req.url = `/businesses/${id}`;
  }

  // Обрабатываем запросы /api/businesses/:id/reviews -> /reviews?businessId=:id
  else if (req.url.match(/^\/api\/businesses\/\d+\/reviews$/)) {
    const id = req.url.split("/")[3];
    req.url = `/reviews?businessId=${id}`;
  }

  // Обрабатываем /api/businesses -> /businesses
  else if (req.url === "/api/businesses") {
    req.url = "/businesses";
  }

  // Обрабатываем /api/categories -> /categories
  else if (req.url === "/api/categories") {
    req.url = "/categories";
  }

  // Другие маршруты из вашего routes.json
  else if (req.url.startsWith("/api/")) {
    req.url = req.url.replace("/api/", "/");
  }

  next();
});

server.use(middlewares);
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server запущен на http://localhost:${PORT}`);
});

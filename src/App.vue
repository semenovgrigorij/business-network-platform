<template>
  <v-app>
    <app-header />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <app-footer />
  </v-app>
</template>

<script>
import AppHeader from "./components/layout/AppHeader.vue";
import AppFooter from "./components/layout/AppFooter.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    AppFooter,
  },

  methods: {
    // Метод для диагностики состояния аутентификации
    checkAuthState() {
      const isAuthenticated = this.$store.getters["auth/isAuthenticated"];
      const token = this.$store.getters["auth/token"];
      const currentUser = this.$store.getters["auth/currentUser"];

      console.group("🔐 Диагностика аутентификации");
      console.log("Пользователь авторизован:", isAuthenticated);
      console.log("Токен присутствует:", !!token);
      if (token) {
        // Проверяем, не истек ли токен (если это JWT)
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          const expiryTime = payload.exp * 1000; // в миллисекундах
          const currentTime = Date.now();

          console.log(
            "Время истечения токена:",
            new Date(expiryTime).toLocaleString()
          );
          console.log("Текущее время:", new Date(currentTime).toLocaleString());
          console.log("Токен истек:", expiryTime < currentTime);
        } catch (error) {
          console.log(
            "Не удалось проверить время истечения токена. Возможно, это не JWT."
          );
        }
      }
      console.log("Данные пользователя:", currentUser);
      console.groupEnd();

      return {
        isAuthenticated,
        hasToken: !!token,
        hasUserData: !!currentUser,
      };
    },
  },

  created() {
    // Запускаем диагностику при запуске приложения
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkAuthState();
      }, 1000); // Даем время на инициализацию хранилища
    });
  },
};
</script>

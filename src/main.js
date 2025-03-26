import "./utils/polyfills";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createStore } from "vuex";

// Импорт модулей Vuex
import auth from "./store/modules/auth";
import businesses from "./store/modules/businesses";
import groups from "./store/modules/groups";
import messages from "./store/modules/messages";
import reviews from "./store/modules/reviews";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

import "leaflet/dist/leaflet.css";

// Создаем хранилище Vuex
const store = createStore({
  state: {
    loading: false,
    error: null,
  },
  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    errorMessage: (state) => state.error,
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
  },
  actions: {
    setLoading({ commit }, isLoading) {
      commit("SET_LOADING", isLoading);
    },
    setError({ commit }, error) {
      commit("SET_ERROR", error);
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    },
  },
  modules: {
    auth,
    businesses,
    groups,
    messages,
    reviews,
  },
});

// Настраиваем Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#424242",
          accent: "#82B1FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FFC107",
        },
      },
    },
  },
});

// Создаем и настраиваем приложение
const app = createApp(App);

// Подключаем плагины
app.use(router);
app.use(store);
app.use(vuetify);

// Монтируем приложение
app.mount("#app");

console.log("Vue app initialized with all plugins");

// Устанавливаем украинскую локаль по умолчанию
if (Intl && Intl.DateTimeFormat) {
  try {
    Intl.DateTimeFormat.prototype.formatToParts = new Intl.DateTimeFormat(
      "uk-UA"
    ).formatToParts;
  } catch (e) {
    console.error("Failed to set default locale", e);
  }
}

// Восстанавливаем сессию при загрузке приложения
store
  .dispatch("auth/initAuth")
  .then(() => {
    console.log("Auth initialized");
  })
  .catch((error) => {
    console.error("Auth initialization failed:", error);
  });

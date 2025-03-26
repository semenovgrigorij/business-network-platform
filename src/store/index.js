// store/index.js
import { createStore } from "vuex";

// Импорт модулей
import auth from "./modules/auth";
import businesses from "./modules/businesses";
import groups from "./modules/groups";
import messages from "./modules/messages";
import reviews from "./modules/reviews";

// Добавим отладочную информацию
console.log("Businesses module structure:", {
  state: businesses.state ? "exists" : "missing",
  getters: businesses.getters ? "exists" : "missing",
  mutations: businesses.mutations ? "exists" : "missing",
  actions: businesses.actions ? "exists" : "missing",
});

// Создаем и экспортируем хранилище
export default createStore({
  state: {
    loading: false,
    error: null,
  },
  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    errorMessage: (state) => state.error,
    isAuthenticated: () => false,
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

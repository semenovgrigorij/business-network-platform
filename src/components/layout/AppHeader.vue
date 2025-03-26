<template>
  <v-app-bar color="primary" dark app>
    <v-app-bar-title>
      <a
        href="/"
        class="font-weight-bold"
        style="text-decoration: none; color: inherit"
      >
        <v-img
          src="/images/design/logo.png"
          alt="Logo"
          class="logo-header"
          max-width="32"
        ></v-img>
        Kolabora BizNetwork
      </a>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <div class="d-none d-md-flex">
      <v-btn text to="/">Головна</v-btn>
      <v-btn text to="/businesses">Бізнеси</v-btn>
      <v-btn text to="/groups">Групи</v-btn>

      <!-- Пункты меню для не авторизованного пользователя -->
      <template v-if="!isAuthenticated">
        <v-btn text to="/login">Вхід</v-btn>
        <v-btn to="/register" variant="outlined" class="ml-2">Реєстрація</v-btn>
      </template>

      <!-- Пункты меню для авторизованного пользователя -->
      <template v-else>
        <v-btn icon @click="goToMessages" class="mx-1">
          <v-badge
            :content="safeUnreadCount.toString()"
            :value="safeUnreadCount > 0"
            color="error"
          >
            <v-icon>mdi-message</v-icon>
          </v-badge>
        </v-btn>

        <v-menu min-width="180">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" class="ml-2">
              <v-avatar size="32">
                <v-img
                  v-if="currentUser && currentUser.avatar"
                  :src="currentUser.avatar"
                  alt="Avatar"
                ></v-img>
                <v-icon v-else>mdi-account-circle</v-icon>
              </v-avatar>
            </v-btn>
          </template>

          <v-list>
            <v-list-item :to="{ name: 'profile' }" prepend-icon="mdi-account">
              <v-list-item-title>Мій профіль</v-list-item-title>
            </v-list-item>

            <v-list-item :to="{ name: 'messages' }" prepend-icon="mdi-message">
              <v-list-item-title>Повідомлення</v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item @click="logout" prepend-icon="mdi-logout">
              <v-list-item-title>Вийти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </div>

    <v-app-bar-nav-icon
      class="d-flex d-md-none"
      @click="toggleDrawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary app>
    <v-list>
      <v-list-item to="/" prepend-icon="mdi-home">
        <v-list-item-title>Головна</v-list-item-title>
      </v-list-item>

      <v-list-item to="/businesses" prepend-icon="mdi-domain">
        <v-list-item-title>Бізнеси</v-list-item-title>
      </v-list-item>

      <v-list-item to="/groups" prepend-icon="mdi-account-group">
        <v-list-item-title>Групи</v-list-item-title>
      </v-list-item>

      <!-- Мобильное меню для не авторизованного пользователя -->
      <template v-if="!isAuthenticated">
        <v-list-item to="/login" prepend-icon="mdi-login">
          <v-list-item-title>Вхід</v-list-item-title>
        </v-list-item>

        <v-list-item to="/register" prepend-icon="mdi-account-plus">
          <v-list-item-title>Реєстрація</v-list-item-title>
        </v-list-item>
      </template>

      <!-- Мобильное меню для авторизованного пользователя -->
      <template v-else>
        <v-list-item :to="{ name: 'messages' }" prepend-icon="mdi-message">
          <v-list-item-title>
            Повідомлення
            <v-badge
              v-if="safeUnreadCount > 0"
              :content="safeUnreadCount.toString()"
              color="error"
              inline
            ></v-badge>
          </v-list-item-title>
        </v-list-item>

        <v-list-item :to="{ name: 'profile' }" prepend-icon="mdi-account">
          <v-list-item-title>Мій профіль</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="logout" prepend-icon="mdi-logout">
          <v-list-item-title>Вийти</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AppHeader",

  data() {
    return {
      drawer: false,
    };
  },

  computed: {
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),

    ...mapGetters("messages", {
      unreadMessagesCount: "unreadCount",
    }),

    safeUnreadCount() {
      return this.unreadMessagesCount || 0;
    },

    currentUserAvatar() {
      return this.currentUser && this.currentUser.avatar
        ? this.currentUser.avatar
        : "/images/placeholders/user-avatar.jpg";
    },
  },

  methods: {
    ...mapActions({
      logoutAction: "auth/logout",
      fetchUnreadCount: "messages/fetchUnreadCount",
    }),

    toggleDrawer() {
      this.drawer = !this.drawer;
    },

    async logout() {
      this.logoutAction();
      this.drawer = false;
      this.$router.push("/");
      try {
        await this.logoutAction();
        this.$toasted.success("Ви успішно вийшли з системи");
      } catch (error) {
        console.error("Помилка при виході:", error);
        this.$toasted.error("Не вдалося вийти з системи");
      }
    },

    goToMessages() {
      this.$router.push({ name: "messages" }); // или просто '/messages'
    },
  },

  mounted() {
    // Если пользователь авторизован, получаем количество непрочитанных сообщений
    if (this.isAuthenticated) {
      this.fetchUnreadCount();
    }
  },
};
</script>
<style scoped>
.font-weight-bold {
  display: flex;
  align-items: center;
  gap: 10px;
}
.v-navigation-drawer {
  transition: all 0.3s ease;
}
</style>

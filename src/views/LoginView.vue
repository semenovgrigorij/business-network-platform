<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title class="text-center text-h5 py-4">
            Вхід у систему
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="py-4">
            <v-form ref="form" v-model="isFormValid" @submit.prevent="login">
              <v-alert
                v-if="hasError"
                type="error"
                class="mb-4"
                closable
                @click:close="clearError"
              >
                {{ errorMessage }}
              </v-alert>

              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                :rules="emailRules"
                autocomplete="email"
                prepend-inner-icon="mdi-email"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                required
                :rules="passwordRules"
                autocomplete="current-password"
                prepend-inner-icon="mdi-lock"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                class="mt-4"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Увійти
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="pb-4 px-4">
            <v-btn variant="text" block @click="$router.push('/register')">
              Ще не зареєстровані? Створити обліковий запис
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
      isFormValid: false,
      emailRules: [
        (v) => !!v || "Email обов'язковий",
        (v) => /.+@.+\..+/.test(v) || "Email має бути валідним",
      ],
      passwordRules: [
        (v) => !!v || "Пароль обов'язковий",
        (v) => v.length >= 6 || "Пароль повинен містити щонайменше 6 символів",
      ],
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),
  },

  methods: {
    ...mapActions({
      loginAction: "auth/login",
      clearError: "clearError",
    }),

    async login() {
      if (!this.$refs.form.validate()) {
        return;
      }

      try {
        await this.loginAction({
          email: this.email,
          password: this.password,
        });

        // Перенаправляем на главную страницу после успешного входа
        this.$router.push("/");
      } catch (error) {
        console.error("Помилка входу:", error);
      }
    },
  },
};
</script>

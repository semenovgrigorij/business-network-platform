<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-center text-h5 py-4">
            Реєстрація
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="py-4">
            <v-form ref="form" v-model="isFormValid" @submit.prevent="register">
              <v-alert
                v-if="hasError"
                type="error"
                class="mb-4"
                closable
                @click:close="clearError"
              >
                {{ errorMessage }}
              </v-alert>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="firstName"
                    label="Ім'я"
                    required
                    :rules="nameRules"
                    prepend-inner-icon="mdi-account"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="lastName"
                    label="Прізвище"
                    required
                    :rules="nameRules"
                    prepend-inner-icon="mdi-account"
                  ></v-text-field>
                </v-col>
              </v-row>

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
                autocomplete="new-password"
                prepend-inner-icon="mdi-lock"
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                label="Підтвердьте пароль"
                type="password"
                required
                :rules="confirmPasswordRules"
                autocomplete="new-password"
                prepend-inner-icon="mdi-lock-check"
              ></v-text-field>

              <v-text-field
                v-model="location"
                label="Місто"
                prepend-inner-icon="mdi-map-marker"
              ></v-text-field>

              <v-textarea
                v-model="bio"
                label="Про себе"
                rows="3"
                counter="300"
                :rules="[(v) => v.length <= 300 || 'Максимум 300 символів']"
                prepend-inner-icon="mdi-information"
              ></v-textarea>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                class="mt-4"
                :loading="isLoading"
                :disabled="!isFormValid"
              >
                Зареєструватись
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="pb-4 px-4">
            <v-btn variant="text" block @click="$router.push('/login')">
              Вже є обліковий запис? Увійти
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
  name: "RegisterView",

  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
      bio: "",
      isFormValid: false,
      nameRules: [
        (v) => !!v || "Ім'я обов'язкове",
        (v) => v.length >= 2 || "Ім'я має містити щонайменше 2 символи",
      ],
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

    confirmPasswordRules() {
      return [
        (v) => !!v || "Підтвердження пароля обов'язкове",
        (v) => v === this.password || "Паролі повинні збігатися",
      ];
    },
  },

  methods: {
    ...mapActions({
      registerAction: "auth/register",
      clearError: "clearError",
    }),

    async register() {
      if (!this.$refs.form.validate()) {
        return;
      }

      try {
        await this.registerAction({
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          location: this.location,
          bio: this.bio,
        });

        // Перенаправляем на главную страницу после успешной регистрации
        this.$router.push("/");
      } catch (error) {
        console.error("Помилка реєстрації:", error);
      }
    },
  },
};
</script>

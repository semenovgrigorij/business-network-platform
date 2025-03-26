<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center pa-4">
            <v-btn icon variant="text" @click="$router.back()" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="text-h5">
              {{ isEdit ? "Редагування бізнесу" : "Додавання нового бізнесу" }}
            </h1>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Состояние загрузки при редактировании -->
          <div v-if="isEdit && isLoading" class="d-flex justify-center my-6">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
          </div>

          <!-- Сообщение об ошибке -->
          <v-alert
            v-if="hasError"
            type="error"
            class="ma-4"
            closable
            @click:close="clearError"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Форма -->
          <v-form
            ref="form"
            v-model="isFormValid"
            @submit.prevent="saveBusiness"
            class="pa-4"
          >
            <!-- Основная информация -->
            <h3 class="text-h6 mb-3">Основна інформація</h3>

            <v-text-field
              v-model="form.name"
              label="Назва бізнесу"
              :rules="nameRules"
              required
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Опис"
              :rules="descriptionRules"
              required
              variant="outlined"
              rows="4"
              auto-grow
              counter="1000"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model="form.image"
              label="URL зображення"
              hint="Вкажіть посилання на зображення для бізнесу"
              persistent-hint
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <!-- Превью изображения -->
            <div v-if="form.image" class="mb-4">
              <v-img
                :src="form.image"
                max-height="200"
                contain
                class="bg-grey-lighten-3"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey-lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </div>

            <v-text-field
              v-model="form.location"
              label="Розташування"
              :rules="locationRules"
              required
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Наприклад: Київ, Україна"
              persistent-hint
            ></v-text-field>

            <v-select
              v-model="form.categories"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Категорії"
              :rules="categoriesRules"
              required
              variant="outlined"
              density="comfortable"
              chips
              multiple
              class="mb-4"
            ></v-select>

            <v-divider class="my-4"></v-divider>

            <!-- Контактная информация -->
            <h3 class="text-h6 mb-3">Контактна інформація</h3>

            <v-text-field
              v-model="form.email"
              label="Email"
              :rules="emailRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="form.phone"
              label="Телефон"
              :rules="phoneRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Наприклад: +38 (099) 123-45-67"
              persistent-hint
            ></v-text-field>

            <v-text-field
              v-model="form.website"
              label="Веб-сайт"
              :rules="websiteRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Наприклад: https://example.com"
              persistent-hint
            ></v-text-field>

            <!-- Кнопки действий -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="outlined" @click="$router.back()" class="mr-3">
                Отмена
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="isSaving"
                :disabled="!isFormValid"
              >
                {{ isEdit ? "Зберегти зміни" : "Створити бізнес" }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "BusinessFormView",

  props: {
    id: {
      type: [String, Number],
      default: null,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isFormValid: false,
      isSaving: false,
      form: {
        name: "",
        description: "",
        image: "",
        location: "",
        categories: [],
        email: "",
        phone: "",
        website: "",
      },

      // Правила валидации
      nameRules: [
        (v) => !!v || "Назва обов'язкова",
        (v) => v.length >= 2 || "Назва повинна містити щонайменше 2 символи",
        (v) => v.length <= 100 || "Назва має бути коротшою за 100 символів",
      ],
      descriptionRules: [
        (v) => !!v || "Опис обов'язковий",
        (v) => v.length >= 20 || "Опис має містити щонайменше 20 символів",
        (v) => v.length <= 1000 || "Опис має бути коротшим за 1000 символів",
      ],
      locationRules: [
        (v) => !!v || "Розташування обов'язкове",
        (v) => v.length >= 3 || "Розташування має містити не менше 3 символів",
      ],
      categoriesRules: [
        (v) => v.length > 0 || "Виберіть хоча б одну категорію",
      ],
      emailRules: [
        (v) => !v || /.+@.+\..+/.test(v) || "Email має бути валідним",
      ],
      phoneRules: [
        (v) =>
          !v ||
          /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}$/.test(
            v
          ) ||
          "Введіть коректний номер телефону.",
      ],
      websiteRules: [
        (v) =>
          !v ||
          /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(
            v
          ) ||
          "Введіть коректний URL",
      ],
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),

    ...mapGetters("businesses", ["currentBusiness", "allCategories"]),

    categories() {
      return this.allCategories || [];
    },
  },

  methods: {
    ...mapActions({
      fetchBusinessById: "businesses/fetchBusinessById",
      fetchCategories: "businesses/fetchCategories",
      createBusiness: "businesses/createBusiness",
      updateBusiness: "businesses/updateBusiness",
      clearError: "clearError",
      createConversation: "messages/createConversation", // Добавляем это действие
    }),
    async loadBusinessData() {
      if (this.isEdit && this.id) {
        // Загружаем данные бизнеса для редактирования
        await this.fetchBusinessById(this.id);

        if (this.currentBusiness) {
          // Заполняем форму данными текущего бизнеса
          this.form.name = this.currentBusiness.name || "";
          this.form.description = this.currentBusiness.description || "";
          this.form.image = this.currentBusiness.image || "";
          this.form.location = this.currentBusiness.location || "";
          // Используем categories с поддержкой формата _id
          this.form.categories =
            this.currentBusiness.categories?.map((c) => c._id || c) || [];
          this.form.email = this.currentBusiness.email || "";
          this.form.phone = this.currentBusiness.phone || "";
          this.form.website = this.currentBusiness.website || "";
        }
      }
    },

    async saveBusiness() {
      try {
        const { valid } = await this.$refs.form.validate();

        if (!valid) return;

        this.isSaving = true;

        const businessData = {
          name: this.form.name,
          description: this.form.description,
          image: this.form.image,
          location: this.form.location,
          categories: this.form.categories,
          email: this.form.email,
          phone: this.form.phone,
          website: this.form.website,
        };

        if (this.isEdit) {
          // Обновляем существующий бизнес
          await this.updateBusiness({
            id: this.id,
            data: businessData,
          });
        } else {
          // Создаем новый бизнес - не сохраняем результат, если он не используется
          await this.createBusiness(businessData);
        }

        // Перенаправляем на список бизнесов с сообщением об успехе
        const action = this.isEdit ? "змінено" : "створено";
        this.$router.push({
          name: "businesses",
          params: { success: `Бізнес успішно ${action}` },
        });
      } catch (error) {
        console.error("Ошибка при сохранении бизнеса:", error);
      } finally {
        this.isSaving = false;
      }
    },
  },

  async mounted() {
    // Загружаем категории
    await this.fetchCategories();

    // Если это редактирование, загружаем данные бизнеса
    if (this.isEdit) {
      await this.loadBusinessData();
    }
  },
};
</script>

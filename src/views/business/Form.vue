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
              {{
                isEdit ? "Редактирование бизнеса" : "Добавление нового бизнеса"
              }}
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
            <h3 class="text-h6 mb-3">Основная информация</h3>

            <v-text-field
              v-model="form.name"
              label="Название бизнеса"
              :rules="nameRules"
              required
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Описание"
              :rules="descriptionRules"
              required
              variant="outlined"
              rows="4"
              auto-grow
              counter="1000"
              class="mb-4"
            ></v-textarea>

            <!-- Загрузка изображения с предпросмотром и обрезкой -->
            <div class="mb-4">
              <label class="text-subtitle-1 mb-2 d-block"
                >Изображение бизнеса</label
              >
              <image-uploader
                v-model="form.image"
                @crop="handleImageCrop"
                @reset="handleImageReset"
              ></image-uploader>
            </div>

            <v-text-field
              v-model="form.location"
              label="Местоположение"
              :rules="locationRules"
              required
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Например: Москва, Россия"
              persistent-hint
            ></v-text-field>

            <v-select
              v-model="form.categories"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Категории"
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
            <h3 class="text-h6 mb-3">Контактная информация</h3>

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
              hint="Например: +7 (999) 123-45-67"
              persistent-hint
            ></v-text-field>

            <v-text-field
              v-model="form.website"
              label="Веб-сайт"
              :rules="websiteRules"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              hint="Например: https://example.com"
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
                {{ isEdit ? "Сохранить изменения" : "Создать бизнес" }}
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
import ImageUploader from "@/components/ImageUploader.vue";

export default {
  name: "BusinessForm",

  components: {
    ImageUploader,
  },

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
      imageBlob: null,
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
        (v) => !!v || "Название обязательно",
        (v) => v.length >= 2 || "Название должно содержать не менее 2 символов",
        (v) => v.length <= 100 || "Название должно быть короче 100 символов",
      ],
      descriptionRules: [
        (v) => !!v || "Описание обязательно",
        (v) =>
          v.length >= 20 || "Описание должно содержать не менее 20 символов",
        (v) => v.length <= 1000 || "Описание должно быть короче 1000 символов",
      ],
      locationRules: [
        (v) => !!v || "Местоположение обязательно",
        (v) =>
          v.length >= 3 ||
          "Местоположение должно содержать не менее 3 символов",
      ],
      categoriesRules: [
        (v) => v.length > 0 || "Выберите хотя бы одну категорию",
      ],
      emailRules: [
        (v) => !v || /.+@.+\..+/.test(v) || "Email должен быть валидным",
      ],
      phoneRules: [
        (v) =>
          !v ||
          /^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}$/.test(
            v
          ) ||
          "Введите корректный номер телефона",
      ],
      websiteRules: [
        (v) =>
          !v ||
          /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(
            v
          ) ||
          "Введите корректный URL",
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

    // Обработчик события обрезки изображения
    handleImageCrop({ blob, url }) {
      // Сохраняем blob для последующей отправки на сервер
      this.imageBlob = blob;
      this.form.image = url;
    },

    // Обработчик события удаления изображения
    handleImageReset() {
      this.imageBlob = null;
      this.form.image = "";
    },

    // Загрузка изображения на сервер
    async uploadImage() {
      if (!this.imageBlob) {
        return this.form.image; // Возвращаем текущий URL, если нет нового изображения
      }

      try {
        // Здесь должен быть код для загрузки на реальный сервер
        // Для демонстрации просто возвращаем локальный URL

        /*
        const formData = new FormData();
        formData.append('image', this.imageBlob, 'business_image.jpg');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        return data.imageUrl;
        */

        return this.form.image; // Возвращаем локальный URL для демонстрации
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
        return "";
      }
    },

    async saveBusiness() {
      try {
        const { valid } = await this.$refs.form.validate();

        if (!valid) return;

        this.isSaving = true;

        // Если есть новое изображение, загружаем его на сервер
        let imageUrl = this.form.image;
        if (this.imageBlob) {
          imageUrl = await this.uploadImage();
        }

        const businessData = {
          name: this.form.name,
          description: this.form.description,
          image: imageUrl,
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

          // Перенаправляем на страницу просмотра
          this.$router.push({
            name: "BusinessDetails",
            params: { id: this.id },
          });
        } else {
          // Создаем новый бизнес
          const newBusiness = await this.createBusiness(businessData);

          // Перенаправляем на страницу созданного бизнеса
          this.$router.push({
            name: "BusinessDetails",
            params: { id: newBusiness._id || newBusiness.id },
          });
        }
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

<!-- src/views/ProfileView.vue -->
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <!-- Профиль (режим просмотра) -->
          <template v-if="!isEditing">
            <v-card-title class="text-h5">
              Профіль
              <v-spacer></v-spacer>
              <v-btn icon @click="startEditing">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-row class="pa-4">
              <v-col cols="12" sm="4" class="text-center">
                <v-avatar size="120" color="grey-lighten-4">
                  <v-img
                    v-if="user && user.avatar"
                    :src="user.avatar"
                    alt="Profile Photo"
                  ></v-img>
                  <v-img
                    v-else
                    src="/images/placeholders/user-avatar.jpg"
                    alt="Default Profile Photo"
                  ></v-img>
                </v-avatar>
              </v-col>

              <v-col cols="12" sm="8">
                <h2 class="text-h4 mb-2">{{ fullName }}</h2>
                <p class="text-body-1">
                  <v-icon class="me-2">mdi-map-marker</v-icon>
                  {{ user?.location || "Не вказано" }}
                </p>
                <p class="text-body-1">
                  <v-icon class="me-2">mdi-email</v-icon>
                  {{ user?.email || "Не вказано" }}
                </p>
                <p class="text-body-1" v-if="user?.phone">
                  <v-icon class="me-2">mdi-phone</v-icon>
                  {{ user.phone }}
                </p>
                <p class="text-body-1" v-if="user?.jobTitle">
                  <v-icon class="me-2">mdi-briefcase</v-icon>
                  {{ user.jobTitle }}
                </p>
              </v-col>
            </v-row>

            <!-- Социальные сети -->
            <v-divider></v-divider>
            <v-card-text v-if="hasSocialLinks">
              <h3 class="text-h6 mb-3">Соціальні мережі</h3>
              <v-btn
                v-if="user?.linkedinUrl"
                :href="user.linkedinUrl"
                target="_blank"
                icon
                variant="text"
                color="blue"
                class="mr-2"
              >
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
              <v-btn
                v-if="user?.facebookUrl"
                :href="user.facebookUrl"
                target="_blank"
                icon
                variant="text"
                color="blue-darken-3"
                class="mr-2"
              >
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn
                v-if="user?.instagramUrl"
                :href="user.instagramUrl"
                target="_blank"
                icon
                variant="text"
                color="purple"
                class="mr-2"
              >
                <v-icon>mdi-instagram</v-icon>
              </v-btn>
              <v-btn
                v-if="user?.twitterUrl"
                :href="user.twitterUrl"
                target="_blank"
                icon
                variant="text"
                color="light-blue"
                class="mr-2"
              >
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
            </v-card-text>

            <!-- Профессиональная информация -->
            <v-divider></v-divider>
            <v-card-text>
              <h3 class="text-h6 mb-2">Професійна інформація</h3>
              <v-row>
                <v-col cols="12" v-if="user?.skills && user.skills.length > 0">
                  <h4 class="text-subtitle-1 mb-2">Навички</h4>
                  <div class="d-flex flex-wrap">
                    <v-chip
                      v-for="skill in user.skills"
                      :key="skill"
                      class="mr-1 mb-1"
                      color="primary"
                      variant="outlined"
                    >
                      {{ skill }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  v-if="user?.experience && user.experience.length > 0"
                >
                  <h4 class="text-subtitle-1 mb-2">Досвід роботи</h4>
                  <v-timeline density="compact" align="start">
                    <v-timeline-item
                      v-for="job in user.experience"
                      :key="job.id"
                      :dot-color="job.current ? 'primary' : 'grey'"
                      :size="job.current ? 'large' : 'small'"
                    >
                      <div class="d-flex flex-column">
                        <span class="text-subtitle-2 font-weight-bold"
                          >{{ job.title }} в {{ job.company }}</span
                        >
                        <span class="text-caption text-grey"
                          >{{ job.startDate }} -
                          {{ job.endDate || "Теперішній час" }}</span
                        >
                        <span class="text-body-2 mt-1">{{
                          job.description
                        }}</span>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- О себе -->
            <v-divider></v-divider>
            <v-card-text>
              <h3 class="text-h6 mb-2">Про мене</h3>
              <p>{{ user?.bio || "Інформація відсутня" }}</p>
            </v-card-text>

            <!-- Галерея фотографий для бизнеса -->
            <template
              v-if="user?.galleryImages && user.galleryImages.length > 0"
            >
              <v-divider></v-divider>
              <v-card-text>
                <h3 class="text-h6 mb-3">Галерея</h3>
                <v-row>
                  <v-col
                    v-for="(image, index) in user.galleryImages"
                    :key="index"
                    cols="6"
                    sm="4"
                    md="3"
                  >
                    <v-img
                      :src="image.url"
                      :alt="image.description || 'Gallery image'"
                      aspect-ratio="1"
                      cover
                      class="rounded-lg"
                      @click="openGalleryImage(index)"
                    ></v-img>
                  </v-col>
                </v-row>
              </v-card-text>
            </template>

            <v-card-actions>
              <v-btn color="error" variant="text" @click="logout">
                <v-icon class="me-2">mdi-logout</v-icon>
                Вийти
              </v-btn>
            </v-card-actions>
          </template>

          <!-- Профиль (режим редактирования) -->
          <template v-else>
            <v-card-title class="text-h5">
              Редагування профілю
              <v-spacer></v-spacer>
              <v-btn icon @click="cancelEditing">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text>
              <v-form
                ref="form"
                v-model="isFormValid"
                @submit.prevent="saveProfile"
              >
                <v-alert
                  v-if="hasError"
                  type="error"
                  class="mb-4"
                  closable
                  @click:close="clearError"
                >
                  {{ errorMessage }}
                </v-alert>

                <!-- Базовая информация и фото -->
                <v-row>
                  <v-col cols="12" class="text-center">
                    <v-avatar size="120" color="grey-lighten-4">
                      <v-img
                        v-if="editForm.avatar"
                        :src="editForm.avatar"
                        alt="Profile Photo"
                      ></v-img>
                      <v-icon v-else size="80" color="grey-darken-2">
                        mdi-account
                      </v-icon>
                    </v-avatar>

                    <div class="mt-2">
                      <v-text-field
                        v-model="editForm.avatar"
                        label="URL аватара"
                        hint="Вставте URL зображення"
                        persistent-hint
                      ></v-text-field>
                    </div>
                  </v-col>
                </v-row>

                <!-- Основная информация -->
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.firstName"
                      label="Ім'я"
                      required
                      :rules="nameRules"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.lastName"
                      label="Прізвище"
                      required
                      :rules="nameRules"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-text-field
                  v-model="editForm.email"
                  label="Email"
                  type="email"
                  required
                  :rules="emailRules"
                  disabled
                ></v-text-field>

                <v-text-field
                  v-model="editForm.phone"
                  label="Телефон"
                  prepend-inner-icon="mdi-phone"
                ></v-text-field>

                <v-text-field
                  v-model="editForm.location"
                  label="Місто"
                  prepend-inner-icon="mdi-map-marker"
                ></v-text-field>

                <v-text-field
                  v-model="editForm.jobTitle"
                  label="Посада"
                  prepend-inner-icon="mdi-briefcase"
                ></v-text-field>

                <!-- Социальные сети -->
                <v-subheader>Соціальні мережі</v-subheader>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.linkedinUrl"
                      label="LinkedIn"
                      prepend-inner-icon="mdi-linkedin"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.facebookUrl"
                      label="Facebook"
                      prepend-inner-icon="mdi-facebook"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.instagramUrl"
                      label="Instagram"
                      prepend-inner-icon="mdi-instagram"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="editForm.twitterUrl"
                      label="Twitter"
                      prepend-inner-icon="mdi-twitter"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Навыки -->
                <v-subheader>Навички</v-subheader>
                <v-combobox
                  v-model="editForm.skills"
                  chips
                  clearable
                  multiple
                  label="Ваші професійні навички"
                  hint="Введіть навичку та натисніть Enter"
                ></v-combobox>

                <!-- Опыт работы -->
                <v-subheader class="mt-4">Досвід роботи</v-subheader>
                <div
                  v-for="(job, index) in editForm.experience"
                  :key="index"
                  class="mb-4 pa-3 rounded bg-grey-lighten-5"
                >
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="job.title"
                        label="Посада"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="job.company"
                        label="Компанія"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="job.startDate"
                        label="Початок роботи"
                        placeholder="Місяць, Рік"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="job.endDate"
                        label="Закінчення роботи"
                        placeholder="Залиште порожнім, якщо це поточна робота"
                        :disabled="job.current"
                      ></v-text-field>
                      <v-checkbox
                        v-model="job.current"
                        label="Поточне місце роботи"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="job.description"
                        label="Опис"
                        auto-grow
                        rows="2"
                      ></v-textarea>
                    </v-col>
                    <v-col cols="12" class="text-right">
                      <v-btn
                        color="error"
                        variant="text"
                        @click="removeExperience(index)"
                      >
                        <v-icon>mdi-delete</v-icon>
                        Видалити
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  @click="addExperience"
                  class="mb-4"
                >
                  <v-icon class="mr-1">mdi-plus</v-icon>
                  Додати досвід роботи
                </v-btn>

                <!-- Галерея фотографий -->
                <v-subheader class="mt-4">Галерея</v-subheader>
                <div
                  v-for="(image, index) in editForm.galleryImages"
                  :key="`gallery-${index}`"
                  class="mb-3 pa-3 rounded bg-grey-lighten-5"
                >
                  <v-row align="center">
                    <v-col cols="12" sm="4">
                      <v-img
                        :src="
                          image.url ||
                          '/images/placeholders/image-placeholder.jpg'
                        "
                        aspect-ratio="1"
                        cover
                        class="rounded"
                        height="100"
                      ></v-img>
                    </v-col>
                    <v-col cols="12" sm="8">
                      <v-text-field
                        v-model="image.url"
                        label="URL зображення"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="image.description"
                        label="Опис"
                      ></v-text-field>
                      <div class="text-right">
                        <v-btn
                          color="error"
                          variant="text"
                          @click="removeGalleryImage(index)"
                        >
                          <v-icon>mdi-delete</v-icon>
                          Видалити
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </div>
                <v-btn
                  color="primary"
                  variant="text"
                  @click="addGalleryImage"
                  class="mb-4"
                >
                  <v-icon class="mr-1">mdi-plus</v-icon>
                  Додати зображення
                </v-btn>

                <!-- О себе -->
                <v-textarea
                  v-model="editForm.bio"
                  label="Про себе"
                  rows="4"
                  counter="500"
                  :rules="[(v) => v.length <= 500 || 'Максимум 500 символів']"
                ></v-textarea>

                <!-- Настройки приватности -->
                <v-subheader class="mt-4"
                  >Налаштування конфіденційності</v-subheader
                >
                <v-checkbox
                  v-model="editForm.privacySettings.showEmail"
                  label="Показувати email іншим користувачам"
                ></v-checkbox>
                <v-checkbox
                  v-model="editForm.privacySettings.showPhone"
                  label="Показувати телефон іншим користувачам"
                ></v-checkbox>
                <v-checkbox
                  v-model="editForm.privacySettings.showSocial"
                  label="Показувати соціальні мережі іншим користувачам"
                ></v-checkbox>

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  class="mt-4"
                  :loading="isLoading"
                  :disabled="!isFormValid"
                >
                  Зберегти зміни
                </v-btn>
              </v-form>
            </v-card-text>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Бизнесы пользователя -->
    <v-row v-if="userBusinesses.length > 0" class="mt-6">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Мої бізнеси</h2>
        <v-row>
          <v-col
            v-for="business in userBusinesses"
            :key="business.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              :to="{ name: 'BusinessDetails', params: { id: business.id } }"
            >
              <v-img
                :src="
                  business.image ||
                  '/images/placeholders/business-placeholder.jpg'
                "
                height="200"
                cover
              ></v-img>
              <v-card-title>{{ business.name }}</v-card-title>
              <v-card-subtitle>
                <v-icon small class="mr-1">mdi-map-marker</v-icon>
                {{ business.location }}
              </v-card-subtitle>
              <v-card-text>
                <div class="d-flex align-center mb-3">
                  <v-rating
                    v-if="business.rating"
                    :model-value="business.rating.overall"
                    color="amber"
                    density="compact"
                    half-increments
                    readonly
                    size="small"
                  ></v-rating>
                  <span class="ml-2" v-if="business.rating">
                    {{ business.rating.overall.toFixed(1) }}
                  </span>
                  <span v-else class="text-grey">Немає оцінок</span>
                  <v-spacer></v-spacer>
                  <v-chip size="small" color="primary" variant="outlined">
                    <v-icon start size="x-small">mdi-eye</v-icon>
                    {{ business.viewCount || 0 }}
                  </v-chip>
                </div>
                <div class="d-flex flex-wrap">
                  <v-chip
                    v-for="categoryId in business.categories.slice(0, 2)"
                    :key="categoryId"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ getCategoryName(categoryId) }}
                  </v-chip>
                  <v-chip v-if="business.categories.length > 2" size="small">
                    +{{ business.categories.length - 2 }}
                  </v-chip>
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="text"
                  :to="{ name: 'EditBusiness', params: { id: business.id } }"
                >
                  <v-icon class="mr-1">mdi-pencil</v-icon>
                  Редагувати
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  :to="{ name: 'BusinessDetails', params: { id: business.id } }"
                >
                  Переглянути
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Диалог для просмотра галереи -->
    <v-dialog v-model="galleryDialog" max-width="800">
      <v-card>
        <v-img
          v-if="selectedGalleryImage"
          :src="selectedGalleryImage.url"
          max-height="600"
          contain
        ></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="prevGalleryImage"
            :disabled="currentGalleryIndex === 0"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            icon
            @click="nextGalleryImage"
            :disabled="
              currentGalleryIndex === (user?.galleryImages?.length || 0) - 1
            "
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="galleryDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ProfileView",

  data() {
    return {
      isEditing: false,
      isFormValid: true,
      editForm: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        avatar: "",
        jobTitle: "",
        linkedinUrl: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        skills: [],
        experience: [],
        galleryImages: [],
        privacySettings: {
          showEmail: true,
          showPhone: true,
          showSocial: true,
        },
      },
      nameRules: [
        (v) => !!v || "Ім'я обов'язкове",
        (v) => v.length >= 2 || "Ім'я має містити щонайменше 2 символи",
      ],
      emailRules: [
        (v) => !!v || "Email обов'язковий",
        (v) => /.+@.+\..+/.test(v) || "Email має бути валідним",
      ],
      galleryDialog: false,
      currentGalleryIndex: 0,
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),

    ...mapGetters("auth", ["currentUser"]),

    ...mapGetters("businesses", ["allBusinesses", "allCategories"]),

    user() {
      return this.currentUser;
    },

    fullName() {
      if (!this.user) return "";
      return `${this.user.firstName} ${this.user.lastName}`;
    },

    hasSocialLinks() {
      return !!(
        this.user?.linkedinUrl ||
        this.user?.facebookUrl ||
        this.user?.instagramUrl ||
        this.user?.twitterUrl
      );
    },

    userBusinesses() {
      if (!this.user || !this.allBusinesses) return [];
      return this.allBusinesses.filter(
        (business) => business.ownerId === this.user.id
      );
    },

    selectedGalleryImage() {
      if (!this.user?.galleryImages || !this.user.galleryImages.length)
        return null;
      return this.user.galleryImages[this.currentGalleryIndex];
    },
  },

  methods: {
    ...mapActions({
      updateProfile: "auth/updateProfile",
      logoutAction: "auth/logout",
      clearError: "clearError",
      fetchBusinesses: "businesses/fetchBusinesses",
      fetchCategories: "businesses/fetchCategories",
    }),

    startEditing() {
      // Инициализируем форму редактирования текущими данными пользователя
      if (this.user) {
        this.editForm = {
          firstName: this.user.firstName || "",
          lastName: this.user.lastName || "",
          email: this.user.email || "",
          phone: this.user.phone || "",
          location: this.user.location || "",
          bio: this.user.bio || "",
          avatar: this.user.avatar || "",
          jobTitle: this.user.jobTitle || "",
          linkedinUrl: this.user.linkedinUrl || "",
          facebookUrl: this.user.facebookUrl || "",
          instagramUrl: this.user.instagramUrl || "",
          twitterUrl: this.user.twitterUrl || "",
          skills: this.user.skills || [],
          experience: this.user.experience ? [...this.user.experience] : [],
          galleryImages: this.user.galleryImages
            ? [...this.user.galleryImages]
            : [],
          privacySettings: this.user.privacySettings || {
            showEmail: true,
            showPhone: true,
            showSocial: true,
          },
        };
      }

      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
    },

    async saveProfile() {
      if (!this.$refs.form.validate()) {
        return;
      }

      try {
        await this.updateProfile(this.editForm);
        this.isEditing = false;
      } catch (error) {
        console.error("Помилка при оновленні профілю:", error);
      }
    },

    async logout() {
      this.logoutAction();
      this.$router.push("/login");
    },

    addExperience() {
      if (!this.editForm.experience) {
        this.editForm.experience = [];
      }

      this.editForm.experience.push({
        id: Date.now(), // Временный ID
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    },

    removeExperience(index) {
      this.editForm.experience.splice(index, 1);
    },

    addGalleryImage() {
      if (!this.editForm.galleryImages) {
        this.editForm.galleryImages = [];
      }

      this.editForm.galleryImages.push({
        url: "",
        description: "",
      });
    },

    removeGalleryImage(index) {
      this.editForm.galleryImages.splice(index, 1);
    },

    openGalleryImage(index) {
      this.currentGalleryIndex = index;
      this.galleryDialog = true;
    },

    nextGalleryImage() {
      if (
        this.currentGalleryIndex <
        (this.user?.galleryImages?.length || 0) - 1
      ) {
        this.currentGalleryIndex++;
      }
    },

    prevGalleryImage() {
      if (this.currentGalleryIndex > 0) {
        this.currentGalleryIndex--;
      }
    },

    getCategoryName(categoryId) {
      const category = this.allCategories.find((cat) => cat.id === categoryId);
      return category ? category.name : "Категорія";
    },
  },

  mounted() {
    // Загружаем бизнесы и категории, если они еще не загружены
    if (!this.allBusinesses.length) {
      this.fetchBusinesses();
    }

    if (!this.allCategories.length) {
      this.fetchCategories();
    }
  },
};
</script>

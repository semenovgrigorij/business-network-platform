<!-- src/views/UserProfile.vue - для просмотра профилей других пользователей -->
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <!-- Основная информация -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Профіль користувача
            <v-spacer></v-spacer>
            <v-btn icon @click="$router.back()">
              <v-icon>mdi-arrow-left</v-icon>
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
              <p class="text-body-1" v-if="user?.jobTitle">
                <v-icon class="me-2">mdi-briefcase</v-icon>
                {{ user.jobTitle }}
              </p>
              <p class="text-body-1" v-if="user?.location">
                <v-icon class="me-2">mdi-map-marker</v-icon>
                {{ user.location }}
              </p>
              <p
                class="text-body-1"
                v-if="user?.email && user.privacySettings?.showEmail !== false"
              >
                <v-icon class="me-2">mdi-email</v-icon>
                {{ user.email }}
              </p>
              <p
                class="text-body-1"
                v-if="user?.phone && user.privacySettings?.showPhone !== false"
              >
                <v-icon class="me-2">mdi-phone</v-icon>
                {{ user.phone }}
              </p>
            </v-col>
          </v-row>

          <!-- Социальные сети -->
          <v-divider
            v-if="hasSocialLinks && user?.privacySettings?.showSocial !== false"
          ></v-divider>
          <v-card-text
            v-if="hasSocialLinks && user?.privacySettings?.showSocial !== false"
          >
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

          <!-- О пользователе -->
          <v-divider v-if="user?.bio"></v-divider>
          <v-card-text v-if="user?.bio">
            <h3 class="text-h6 mb-2">Про користувача</h3>
            <p>{{ user.bio }}</p>
          </v-card-text>

          <!-- Навыки -->
          <v-divider v-if="user?.skills && user.skills.length > 0"></v-divider>
          <v-card-text v-if="user?.skills && user.skills.length > 0">
            <h3 class="text-h6 mb-2">Навички</h3>
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
          </v-card-text>

          <!-- Кнопка контакта -->
          <v-card-actions v-if="!isOwnProfile">
            <v-btn color="primary" block @click="startConversation">
              <v-icon class="mr-1">mdi-message</v-icon>
              Написати повідомлення
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Опыт работы -->
        <v-card
          v-if="user?.experience && user.experience.length > 0"
          class="mb-4"
        >
          <v-card-title class="text-h5">Досвід роботи</v-card-title>
          <v-card-text>
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
                  <span class="text-body-2 mt-1">{{ job.description }}</span>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>

        <!-- Галерея -->
        <v-card
          v-if="user?.galleryImages && user.galleryImages.length > 0"
          class="mb-4"
        >
          <v-card-title class="text-h5">Галерея</v-card-title>
          <v-card-text>
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
        </v-card>
      </v-col>
    </v-row>

    <!-- Бизнесы пользователя -->
    <v-row v-if="userBusinesses.length > 0" class="mt-4">
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Бізнеси користувача</h2>
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
                <div class="d-flex flex-wrap">
                  <v-chip
                    v-for="categoryId in business.categories.slice(0, 3)"
                    :key="categoryId"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ getCategoryName(categoryId) }}
                  </v-chip>
                </div>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
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
import dataService from "@/services/dataService";

export default {
  name: "UserProfile",

  props: {
    id: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      galleryDialog: false,
      currentGalleryIndex: 0,
      user: null,
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),

    ...mapGetters("businesses", ["allBusinesses", "allCategories"]),

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

    isOwnProfile() {
      const currentUser = this.$store.getters["auth/currentUser"];
      return currentUser && this.user && this.user.id === currentUser.id;
    },
  },

  methods: {
    ...mapActions({
      fetchBusinesses: "businesses/fetchBusinesses",
      fetchCategories: "businesses/fetchCategories",
      createConversation: "messages/createConversation",
    }),

    async loadUserProfile() {
      try {
        // Показываем индикатор загрузки
        this.$store.dispatch("setLoading", true);

        // Делаем запрос к API
        const response = await dataService.getUserById(this.id);
        this.user = response;

        console.log("User data loaded successfully:", this.user);
      } catch (error) {
        console.error("Error loading user profile:", error);

        // Показываем сообщение об ошибке
        this.$store.dispatch(
          "setError",
          "Не вдалося завантажити дані користувача"
        );

        // Опционально - перенаправляем на 404 страницу, если пользователь не найден
        if (error.response && error.response.status === 404) {
          this.$router.push({ name: "NotFound" });
        }
      } finally {
        // Скрываем индикатор загрузки
        this.$store.dispatch("setLoading", false);
      }
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

    async startConversation() {
      console.log("startConversation called in user profile");

      // Проверка наличия данных пользователя
      if (!this.user) {
        console.error("User data is missing");
        return;
      }

      // Получаем текущего пользователя
      const currentUser = this.$store.getters["auth/currentUser"];
      console.log("Current user:", currentUser);
      console.log("Recipient user:", this.user);

      // Проверка на отправку сообщения самому себе
      if (currentUser && this.user.id === currentUser.id) {
        console.error("Cannot send message to yourself");
        // Можно показать уведомление пользователю
        // this.$toasted.error("Неможливо почати бесіду з самим собою");
        return;
      }

      try {
        const recipientId =
          typeof this.user.id === "string"
            ? this.user.id
            : String(this.user.id);

        console.log("Recipient ID:", recipientId);

        const conversationData = {
          recipientId: recipientId,
          initialMessage: "Привіт! Хотів би з вами поспілкуватися.",
        };

        console.log("Conversation data:", conversationData);
        console.log("Before calling createConversation");

        const conversation = await this.createConversation(conversationData);

        console.log("Conversation created:", conversation);

        if (conversation && conversation.id) {
          console.log("Redirecting to conversation:", conversation.id);
          this.$router.push({
            name: "Conversation",
            params: { id: conversation.id },
          });
        } else {
          console.error("No conversation ID returned");
        }
      } catch (error) {
        console.error("Error in startConversation:", error);
        console.error("Error details:", error.response?.data || error.message);
      }
    },
  },

  async mounted() {
    await this.loadUserProfile();

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

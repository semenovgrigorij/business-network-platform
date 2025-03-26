<template>
  <v-container>
    <h1>Деталі бізнесу</h1>

    <div v-if="isLoading || localLoading">Завантаження...</div>
    <div v-else-if="hasError">Помилка: {{ errorMessage }}</div>
    <div v-else-if="business">
      <h2>{{ business.name }}</h2>
      <p>{{ business.description }}</p>

      <!-- Карта с местоположением -->
      <v-card class="mb-6 mt-6" v-if="business.coordinates">
        <v-card-title>
          <h2 class="text-h5">Розташування</h2>
        </v-card-title>
        <v-card-text>
          <div v-if="business.coordinates">
            <map-component
              ref="mapComponent"
              :height="400"
              :latitude="business.coordinates.latitude"
              :longitude="business.coordinates.longitude"
              :zoom="15"
              :markers="[getBusinessMarker]"
              :show-current-location="true"
              @marker-click="handleMarkerClick"
              @location-found="handleLocationFound"
              @location-error="handleLocationError"
            ></map-component>

            <div class="d-flex justify-space-between align-center mt-3">
              <div>
                <p class="text-body-2 mb-0">
                  <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                  {{ business.location }}
                </p>
              </div>
              <div>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="centerOnUserLocation"
                >
                  <v-icon size="small" class="mr-1">mdi-crosshairs-gps</v-icon>
                  Моє місцезнаходження
                </v-btn>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4">
            <v-icon size="48" color="grey-lighten-1" class="mb-2"
              >mdi-map-marker-off</v-icon
            >
            <p class="text-body-1 text-grey">
              Координати розташування недоступні
            </p>
          </div>
        </v-card-text>
      </v-card>

      <!-- Отзывы -->
      <business-reviews
        :business-id="businessId"
        class="mt-6 mb-6"
      ></business-reviews>

      <!-- Блок с информацией о владельце на странице деталей бизнеса -->
      <v-card class="mb-6" v-if="owner || ownerLoading">
        <v-card-title>Про власника</v-card-title>
        <v-card-text v-if="ownerLoading">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          Завантаження інформації про власника...
        </v-card-text>
        <v-card-text v-else-if="ownerError">
          <p class="text-body-1 text-error">{{ ownerError }}</p>
        </v-card-text>
        <v-card-text v-else-if="owner">
          <user-profile-card
            :user="owner"
            :show-details="true"
            :show-contact="isAuthenticated && !isOwner"
            @contact="startConversation"
          >
            <template v-slot:actions>
              <v-btn
                v-if="isAuthenticated && !isOwner"
                color="primary"
                variant="outlined"
                size="small"
                :to="{ name: 'UserProfile', params: { id: owner.id } }"
              >
                Переглянути профіль
              </v-btn>
            </template>
          </user-profile-card>
        </v-card-text>
      </v-card>
      <v-card class="mb-6" v-else>
        <v-card-title>Про власника</v-card-title>
        <v-card-text>
          <p class="text-body-1">Інформація про власника недоступна</p>
        </v-card-text>
      </v-card>
    </div>
    <div v-else>Бізнес не знайдено</div>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import MapComponent from "@/components/MapComponent.vue";
import UserProfileCard from "@/components/UserProfileCard.vue";
import BusinessReviews from "@/components/BusinessReviews.vue";
import dataService from "@/services/dataService";

export default {
  name: "BusinessDetailView",

  components: {
    MapComponent,
    UserProfileCard,
    BusinessReviews,
  },

  props: {
    // Опциональный ID бизнеса, если передан через маршрутизацию
    id: {
      type: [String, Number],
      default: null,
      required: true,
    },
  },

  data() {
    return {
      localLoading: false,
      userLocation: null,
      owner: null,
      ownerLoading: false,
      ownerError: null,
      // Для случаев, когда id меняется динамически
      businessId: null,
    };
  },

  computed: {
    ...mapGetters(["hasError", "errorMessage"]),
    ...mapGetters("auth", ["isAuthenticated", "currentUser"]),
    ...mapGetters("businesses", ["currentBusiness", "loading"]),

    // Объединяем состояния загрузки
    isLoading() {
      return this.loading;
    },

    business() {
      return this.currentBusiness;
    },

    isOwner() {
      if (!this.isAuthenticated || !this.business || !this.currentUser) {
        return false;
      }
      return this.business.ownerId === this.currentUser.id;
    },

    getBusinessMarker() {
      if (!this.business || !this.business.coordinates) return null;

      return {
        id: this.business.id,
        latitude: this.business.coordinates.latitude,
        longitude: this.business.coordinates.longitude,
        title: this.business.name,
        description: this.business.description
          ? this.business.description.substring(0, 100) + "..."
          : "",
      };
    },
  },

  created() {
    console.log("Detail component created");
    this.initializeComponent();
  },

  watch: {
    // Реагируем на изменение ID через props или через маршрут
    id: "initializeComponent",
    "$route.params.id": "initializeComponent",
  },

  methods: {
    ...mapActions({
      createConversation: "messages/createConversation",
      setError: "setError",
    }),

    // Инициализируем компонент, определяя правильный ID
    initializeComponent() {
      // Используем ID из props или из параметров маршрута
      const businessId = this.id || this.$route.params.id;

      console.log("Initializing with business ID:", businessId);

      if (
        !businessId ||
        (typeof businessId !== "string" && typeof businessId !== "number")
      ) {
        console.warn("Invalid business ID format:", businessId);
        this.$router.replace({ name: "Businesses" });
        return;
      }

      this.businessId = businessId;

      // Загружаем бизнес, если он ещё не загружен или это другой бизнес
      if (!this.business || String(this.business.id) !== String(businessId)) {
        this.loadBusinessData(businessId);
      } else if (this.business && this.business.ownerId && !this.owner) {
        // Если бизнес уже загружен, но данные владельца еще нет
        this.loadBusinessOwner();
      }
    },

    async loadBusinessData(businessId) {
      this.localLoading = true;
      try {
        console.log("Fetching business data for ID:", businessId);
        await this.$store.dispatch("businesses/fetchBusinessById", businessId);
        console.log("Business data received:", this.business);

        // Загружаем данные владельца после загрузки данных бизнеса
        if (this.business && this.business.ownerId) {
          console.log("Loading owner data for business ID:", businessId);
          this.loadBusinessOwner();
        }
      } catch (error) {
        console.error("Error fetching business:", error);
        this.setError({
          message: `Не вдалося завантажити дані бізнесу: ${error.message}`,
        });
      } finally {
        this.localLoading = false;
      }
    },

    async loadBusinessOwner() {
      if (
        this.business &&
        (this.business.ownerId || this.business.owner?._id)
      ) {
        const ownerId = this.business.ownerId || this.business.owner?._id;

        if (
          typeof this.business.ownerId === "object" &&
          this.business.ownerId !== null
        ) {
          // Если ownerId - это объект, значит данные владельца уже есть в ответе API
          console.log(
            "Owner data already in business response:",
            this.business.ownerId
          );
          this.owner = {
            _id: this.business.ownerId._id || this.business.ownerId.id,
            firstName: this.business.ownerId.firstName,
            lastName: this.business.ownerId.lastName,
            // Дополнительные поля, если они нужны для отображения
            avatar:
              this.business.ownerId.avatar ||
              "/images/placeholders/user-avatar.jpg",
            location: this.business.location,
          };
          return;
        }

        try {
          this.ownerLoading = true;
          this.ownerError = null;

          try {
            // Используем dataService вместо прямого обращения к API
            this.owner = await dataService.getUserById(ownerId);
            console.log("Owner data received:", this.owner);
          } catch (apiError) {
            console.warn(
              "API недоступен, используем моковые данные:",
              apiError
            );
            // Моковые данные с учетом формата _id
            this.owner = {
              _id: ownerId,
              firstName: "Власник",
              lastName: "Бізнесу",
              // ...остальные поля
            };
          }
        } catch (error) {
          console.error("Помилка при завантаженні даних про власника:", error);
          this.ownerError = "Не вдалося завантажити інформацію про власника";
        } finally {
          this.ownerLoading = false;
        }
      }
    },

    async startConversation() {
      if (!this.owner) return;

      try {
        console.log("Starting conversation with owner:", this.owner.id);

        // Убедимся, что мы передаем правильные параметры
        const conversationData = {
          recipientId: this.owner._id || this.owner.id, // Используем _id с запасным вариантом id
          initialMessage: `Привіт! Я зацікавлений у вашому бізнесі "${this.business?.name}".`,
          // Если нужно, можно добавить businessId
          businessId: this.business?._id || this.business?.id,
        };

        console.log("Conversation data:", conversationData);

        // Правильный вызов с отдельными параметрами
        const conversation = await dataService.createConversation(
          conversationData
        );

        console.log("Conversation created:", conversation);

        // Перенаправляем на страницу чата
        if (conversation && (conversation._id || conversation.id)) {
          this.$router.push({
            name: "Conversation",
            params: { id: conversation._id || conversation.id },
          });
        } else {
          console.error("No conversation ID returned");
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    },

    handleMarkerClick(markerId) {
      console.log("Клик по маркеру с ID:", markerId);
    },

    handleLocationFound(location) {
      console.log("Местоположение пользователя определено:", location);
      this.userLocation = location;
    },

    handleLocationError(error) {
      console.error("Ошибка определения местоположения:", error);
    },

    centerOnUserLocation() {
      if (this.$refs.mapComponent) {
        this.$refs.mapComponent.centerOnUser();
      }
    },
  },
};
</script>

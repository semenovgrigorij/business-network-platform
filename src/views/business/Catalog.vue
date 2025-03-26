<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <h1 class="text-h4">Каталог бізнесів</h1>
          <v-spacer></v-spacer>
          <v-btn
            v-if="isAuthenticated"
            color="primary"
            prepend-icon="mdi-plus"
            :to="{ name: 'NewBusiness' }"
          >
            Додати бізнес
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Фильтры и поиск -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Пошук за назвою чи описом"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              :key="
                'category-select-' + (allCategories ? allCategories.length : 0)
              "
              v-model="selectedCategory"
              :items="categories"
              item-title="name"
              item-value="id"
              label="Категорія"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
              return-object
            ></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="selectedLocation"
              label="Місто чи область"
              prepend-inner-icon="mdi-map-marker"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="applyFilters"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="2" class="d-flex align-center">
            <v-btn
              variant="text"
              color="primary"
              @click="resetFilters"
              class="ml-auto"
            >
              Скинути
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Карта бизнесов -->
    <v-card class="mb-6">
      <v-card-title>
        <h2 class="text-h5">Карта бізнесів</h2>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="showMap" mandatory>
          <v-btn :value="false" icon>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
          <v-btn :value="true" icon>
            <v-icon>mdi-map</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text v-if="showMap">
        <!-- Радиус поиска, показывается только при определенном местоположении -->
        <v-row v-if="userLocation">
          <v-col cols="12">
            <v-slider
              v-model="radiusFilter"
              class="mt-4"
              label="Радіус пошуку"
              thumb-label
              :min="1"
              :max="50"
              :step="1"
              @update:model-value="applyLocationFilter"
            >
              <template v-slot:thumb-label="{ modelValue }">
                {{ modelValue }} км
              </template>
            </v-slider>
          </v-col>
        </v-row>

        <!-- Компонент карты -->
        <map-component
          ref="catalogMap"
          :height="500"
          :latitude="mapCenter.latitude"
          :longitude="mapCenter.longitude"
          :zoom="11"
          :markers="businessMarkers"
          :show-current-location="true"
          @marker-click="handleMarkerClick"
          @location-found="handleLocationFound"
          @location-error="handleLocationError"
        ></map-component>

        <!-- Панель управления картой -->
        <div class="d-flex justify-space-between align-center mt-3">
          <v-chip v-if="userLocation" color="primary" class="mr-2">
            <v-icon start>mdi-crosshairs-gps</v-icon>
            Ваше місцезнаходження визначено
          </v-chip>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            size="small"
            @click="fitToAllMarkers"
            v-if="businessMarkers.length > 0"
            class="mr-2"
          >
            <v-icon size="small" class="mr-1">mdi-fit-to-screen</v-icon>
            Показати всі бізнеси
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            size="small"
            @click="centerOnUserLocation"
            v-if="userLocation"
          >
            <v-icon size="small" class="mr-1">mdi-crosshairs-gps</v-icon>
            Моє місцезнаходження
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="d-flex justify-center my-10">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <!-- Сообщение об ошибке -->
    <v-alert v-else-if="hasError" type="error" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <!-- Список бизнесов -->
    <v-row v-else-if="filteredBusinesses.length > 0 && !showMap">
      <v-col
        v-for="business in filteredBusinesses"
        :key="business.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="h-100 d-flex flex-column"
          :to="{
            name: 'BusinessDetails',
            params: { id: business._id || business.id },
          }"
        >
          <v-img
            :src="
              business.image ||
              'https://via.placeholder.com/300x150?text=Бизнес'
            "
            height="150"
            cover
            class="align-end"
          >
            <v-card-title
              class="text-white bg-black bg-opacity-60 text-truncate"
            >
              {{ business.name }}
            </v-card-title>
          </v-img>

          <v-card-text class="flex-grow-1">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              <span class="text-caption">{{ business.location }}</span>
            </div>

            <p class="text-body-2 text-truncate-3-lines mb-3">
              {{ business.description }}
            </p>

            <div class="d-flex flex-wrap">
              <v-chip
                v-for="categoryId in business.categories"
                :key="categoryId"
                size="small"
                color="primary"
                variant="outlined"
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
              color="primary"
              :to="{ name: 'BusinessDetails', params: { id: business.id } }"
            >
              Докладніше
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Пустое состояние -->
    <v-card v-else-if="!showMap" class="text-center py-8">
      <v-card-text>
        <v-icon
          icon="mdi-domain-off"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        ></v-icon>
        <h3 class="text-h5 mb-2">Бізнес не знайдено</h3>
        <p class="text-body-1 mb-4">
          За вашим запитом не знайдено жодного бізнесу
        </p>
        <v-btn color="primary" @click="resetFilters"> Скинути фільтри </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "BusinessCatalog",

  components: {
    MapComponent,
  },

  data() {
    return {
      searchQuery: "",
      selectedCategory: null,
      selectedLocation: "",
      showMap: false,
      userLocation: null,
      mapCenter: {
        latitude: 50.450001, // Центр Киева
        longitude: 30.523333,
      },
      radiusFilter: 10,
      radiusCircle: null,
      isComponentReady: false,
    };
  },

  computed: {
    ...mapGetters(["isLoading", "hasError", "errorMessage"]),

    ...mapGetters("auth", ["isAuthenticated"]),

    ...mapGetters("businesses", [
      "allBusinesses",
      "filteredBusinesses",
      "allCategories",
    ]),

    categories() {
      console.log(
        "Computing categories, allCategories length:",
        this.allCategories.length
      );
      // Добавляем опцию "Усі категорії" в начало списка
      const result = [
        { id: null, name: "Усі категорії" },
        ...this.allCategories,
      ];
      console.log("Final categories array:", result);
      return result;
    },
    businessMarkers() {
      return this.filteredBusinesses
        .filter((business) => business.coordinates)
        .map((business) => ({
          id: business._id || business.id, // Поддержка обоих форматов
          latitude: business.coordinates.latitude,
          longitude: business.coordinates.longitude,
          title: business.name,
          description: business.description
            ? business.description.length > 100
              ? business.description.substring(0, 100) + "..."
              : business.description
            : "",
        }));
    },
  },

  methods: {
    ...mapActions("businesses", [
      "fetchBusinesses",
      "fetchCategories",
      "setFilters",
    ]),
    applyFilters() {
      // Вызов действия Vuex для установки фильтров
      this.setFilters({
        query: this.searchQuery,
        category: this.selectedCategory
          ? this.selectedCategory._id || this.selectedCategory.id
          : null,
        location: this.selectedLocation,
      });
    },

    resetFilters() {
      // Сброс локальных фильтров
      this.searchQuery = "";
      this.selectedCategory = null;
      this.selectedLocation = "";
      this.radiusFilter = 10;

      // Удаляем круг радиуса с карты, если он есть
      if (
        this.radiusCircle &&
        this.$refs.catalogMap &&
        this.$refs.catalogMap.map
      ) {
        this.radiusCircle = null;

        if (this.$refs.catalogMap.clearRadius) {
          this.$refs.catalogMap.clearRadius();
        }
      }

      // Вызов действия Vuex для сброса фильтров
      this.$store.dispatch("businesses/resetFilters");
    },

    getCategoryName(categoryId) {
      const category = this.allCategories.find(
        (cat) => cat._id === categoryId || cat.id === categoryId
      );
      return category ? category.name : "Категорія";
    },

    handleMarkerClick(markerId) {
      this.$router.push({ name: "BusinessDetails", params: { id: markerId } });
    },

    handleLocationFound(location) {
      console.log("Местоположение пользователя определено:", location);
      this.userLocation = location;

      if (!this.selectedLocation) {
        this.mapCenter = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }
    },

    handleLocationError(error) {
      console.error("Ошибка определения местоположения:", error);
    },

    centerOnUserLocation() {
      if (this.userLocation && this.$refs.catalogMap) {
        this.$refs.catalogMap.centerOnUser();
      }
    },

    fitToAllMarkers() {
      if (
        this.$refs.catalogMap &&
        typeof this.$refs.catalogMap.fitMapToMarkers === "function"
      ) {
        this.$refs.catalogMap.fitMapToMarkers();
      } else {
        console.warn("fitMapToMarkers method is not available");
      }
    },

    applyLocationFilter() {
      if (!this.userLocation) return;

      this.setFilters({
        coordinates: this.userLocation,
        radius: this.radiusFilter,
      });

      this.drawRadiusCircle();
    },

    drawRadiusCircle() {
      if (!this.$refs.catalogMap || !this.userLocation) return;

      if (typeof this.$refs.catalogMap.drawRadius === "function") {
        this.$refs.catalogMap.drawRadius(
          this.userLocation.latitude,
          this.userLocation.longitude,
          this.radiusFilter
        );
      } else {
        console.warn("drawRadius method is not available");
      }
    },

    async fetchCategories() {
      try {
        await this.$store.dispatch("businesses/fetchCategories");
        console.log("Fetched categories:", this.allCategories);

        // Принудительно обновляем компонент после загрузки категорий
        this.$nextTick(() => {
          if (this.$refs.categorySelect) {
            this.$refs.categorySelect.validate();
          }
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
  },

  mounted() {
    console.log("Initial allCategories:", this.allCategories);
    // Загружаем список бизнесов и категорий при монтировании компонента
    this.fetchBusinesses();
    this.fetchCategories();
  },
};
</script>

<style scoped>
.text-truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

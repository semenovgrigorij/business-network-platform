<template>
  <div>
    <div
      ref="mapContainer"
      :style="{ height: height + 'px', width: '100%' }"
      class="map-container"
    ></div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
  name: "MapComponent",

  props: {
    height: {
      type: Number,
      default: 400,
    },
    latitude: {
      type: Number,
      default: 55.751244,
    },
    longitude: {
      type: Number,
      default: 37.618423,
    },
    zoom: {
      type: Number,
      default: 13,
    },
    markers: {
      type: Array,
      default: () => [],
    },
    showCurrentLocation: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      map: null,
      markerLayer: null,
      userMarker: null,
      userLocation: null,
    };
  },

  watch: {
    markers: {
      handler() {
        this.updateMarkers();
      },
      deep: true,
    },
    latitude() {
      this.updateMapCenter();
    },
    longitude() {
      this.updateMapCenter();
    },
  },

  methods: {
    initMap() {
      // Проверяем, инициализирована ли уже карта
      if (this.map) return;

      // Удаляем фиксированную ссылку на сайт Leaflet, чтобы не показывать логотип
      const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      // Создаем карту
      this.map = L.map(this.$refs.mapContainer).setView(
        [this.latitude, this.longitude],
        this.zoom
      );

      // Добавляем слой тайлов OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution,
        maxZoom: 19,
      }).addTo(this.map);

      // Создаем группу маркеров
      this.markerLayer = L.layerGroup().addTo(this.map);

      // Добавляем маркеры, если они есть
      this.updateMarkers();

      // Получаем текущую локацию, если требуется
      if (this.showCurrentLocation) {
        this.getCurrentLocation();
      }
    },

    updateMapCenter() {
      if (this.map) {
        this.map.setView([this.latitude, this.longitude], this.zoom);
      }
    },

    updateMarkers() {
      // Очищаем существующие маркеры
      if (this.markerLayer) {
        this.markerLayer.clearLayers();
      }

      // Добавляем новые маркеры
      this.markers.forEach((marker) => {
        const { latitude, longitude, title, description, id } = marker;

        // Создаем иконку маркера
        const defaultIcon = L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Создаем маркер
        const leafletMarker = L.marker([latitude, longitude], {
          title,
          icon: defaultIcon,
        }).addTo(this.markerLayer);

        // Добавляем всплывающее окно с информацией
        leafletMarker.bindPopup(`
          <div>
            <h3>${title}</h3>
            <p>${description || ""}</p>
            ${
              id
                ? `<button class="map-popup-button" data-id="${id}">Подробнее</button>`
                : ""
            }
          </div>
        `);

        // Добавляем обработчик для кнопки
        leafletMarker.on("popupopen", () => {
          setTimeout(() => {
            const button = document.querySelector(
              `.map-popup-button[data-id="${id}"]`
            );
            if (button) {
              button.addEventListener("click", () => {
                this.$emit("marker-click", id);
              });
            }
          }, 10);
        });
      });
    },

    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.userLocation = { latitude, longitude };

            // Создаем маркер для пользователя
            if (this.userMarker) {
              this.userMarker.setLatLng([latitude, longitude]);
            } else {
              // Создаем иконку для маркера пользователя (синяя точка)
              const userIcon = L.divIcon({
                className: "user-location-marker",
                html: '<div class="user-marker-inner"></div>',
                iconSize: [16, 16],
              });

              this.userMarker = L.marker([latitude, longitude], {
                icon: userIcon,
                zIndexOffset: 1000, // Выше, чем у обычных маркеров
              }).addTo(this.map);

              this.userMarker.bindPopup("Вы находитесь здесь");
            }

            // Передаем информацию о локации наверх
            this.$emit("location-found", { latitude, longitude });

            // Центрируем карту на пользователе, если нет других маркеров
            if (this.markers.length === 0) {
              this.map.setView([latitude, longitude], this.zoom);
            }
          },
          (error) => {
            console.error("Ошибка получения геолокации:", error);
            this.$emit("location-error", error);
          }
        );
      }
    },

    // Метод для центрирования на пользователе
    centerOnUser() {
      if (this.userLocation) {
        this.map.setView(
          [this.userLocation.latitude, this.userLocation.longitude],
          this.zoom
        );
      } else {
        this.getCurrentLocation();
      }
    },

    // Метод для построения маршрута от пользователя до маркера
    routeToMarker(markerId) {
      const marker = this.markers.find((m) => m.id === markerId);
      if (!marker || !this.userLocation) return;

      // Здесь можно использовать API для построения маршрута
      // Например, Leaflet Routing Machine или OpenRouteService
      this.$emit("route-requested", {
        from: this.userLocation,
        to: { latitude: marker.latitude, longitude: marker.longitude },
      });
    },
  },

  mounted() {
    this.initMap();
  },

  beforeUnmount() {
    // Уничтожаем карту при удалении компонента
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
};
</script>

<style scoped>
.map-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Стили для маркера пользователя */
:deep(.user-location-marker) {
  background: transparent;
}
:deep(.user-marker-inner) {
  width: 16px;
  height: 16px;
  background-color: #3388ff;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(51, 136, 255, 0.5), 0 0 5px rgba(0, 0, 0, 0.3);
}

/* Стили для кнопки во всплывающем окне */
:deep(.map-popup-button) {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-top: 5px;
  cursor: pointer;
  font-size: 12px;
}
:deep(.map-popup-button:hover) {
  background-color: #1565c0;
}
</style>

<template>
  <div>
    <!-- Загрузка изображения -->
    <v-file-input
      v-model="imageFile"
      accept="image/*"
      label="Загрузить изображение"
      prepend-icon="mdi-camera"
      variant="outlined"
      density="comfortable"
      :disabled="loading"
      @update:model-value="handleFileChange"
      hide-details
    ></v-file-input>

    <!-- Предпросмотр изображения -->
    <div v-if="imageSrc && !showCropper" class="mt-3 mb-3 text-center">
      <v-img
        :src="imageSrc"
        max-height="300"
        :aspect-ratio="16 / 9"
        cover
        class="bg-grey-lighten-2 rounded"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-row>
        </template>
      </v-img>

      <div class="d-flex justify-space-between mt-2">
        <v-btn
          color="primary"
          variant="text"
          :disabled="loading"
          @click="showCropper = true"
        >
          <v-icon left class="mr-1">mdi-crop</v-icon>
          Обрезать
        </v-btn>

        <v-btn
          color="error"
          variant="text"
          :disabled="loading"
          @click="resetImage"
        >
          <v-icon left class="mr-1">mdi-delete</v-icon>
          Удалить
        </v-btn>
      </div>
    </div>

    <!-- Обрезчик изображений -->
    <v-dialog v-model="showCropper" max-width="700">
      <v-card>
        <v-card-title>Обрезка изображения</v-card-title>
        <v-card-text>
          <div class="cropper-container">
            <Cropper
              ref="cropper"
              class="cropper"
              :src="imageSrc"
              :stencil-props="{
                aspectRatio: 16 / 9,
              }"
              :default-boundaries="'fill'"
              image-restriction="stencil"
              :canvas="{ width: 1200, height: 675 }"
              background-class="bg-grey-lighten-2"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showCropper = false"
          >
            Отмена
          </v-btn>
          <v-btn color="primary" @click="cropImage" :loading="loading">
            Применить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Скрытое поле с URL изображения для формы -->
    <input type="hidden" :value="imageUrl" />
  </div>
</template>

<script>
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

export default {
  name: "ImageUploader",

  components: {
    Cropper,
  },

  props: {
    value: {
      type: String,
      default: "",
    },
    aspectRatio: {
      type: Number,
      default: 16 / 9,
    },
  },

  data() {
    return {
      imageFile: null,
      imageSrc: "",
      imageUrl: "",
      showCropper: false,
      loading: false,
    };
  },

  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        if (newValue && newValue !== this.imageUrl) {
          this.imageSrc = newValue;
          this.imageUrl = newValue;
        }
      },
    },
  },

  methods: {
    handleFileChange(file) {
      if (!file) {
        this.resetImage();
        return;
      }

      // Создаем URL из файла для отображения
      this.imageSrc = URL.createObjectURL(file);

      // Показываем предпросмотр без обрезки сначала
      this.showCropper = false;
    },

    async cropImage() {
      this.loading = true;

      try {
        const { coordinates, canvas } = this.$refs.cropper.getResult();

        // Преобразуем canvas в Blob
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.9);
        });

        // В реальном приложении здесь был бы запрос на сервер
        // Но для демонстрации создаем URL из blob
        const newImageUrl = URL.createObjectURL(blob);

        // Сохраняем результат
        this.imageSrc = newImageUrl;
        this.imageUrl = newImageUrl;

        // Эмитим событие с данными для загрузки на сервер
        this.$emit("crop", {
          blob,
          coordinates,
          url: newImageUrl,
        });

        // Эмитим событие изменения для v-model
        this.$emit("input", newImageUrl);

        // Закрываем обрезчик
        this.showCropper = false;
      } catch (error) {
        console.error("Ошибка при обрезке изображения:", error);
      } finally {
        this.loading = false;
      }
    },

    async uploadToServer(blob) {
      // Здесь должна быть реальная логика загрузки на сервер
      // Например, с использованием FormData и fetch или axios

      /*
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      return data.imageUrl;
      */

      // Для демонстрации просто возвращаем локальный URL
      return URL.createObjectURL(blob);
    },

    resetImage() {
      this.imageFile = null;
      this.imageSrc = "";
      this.imageUrl = "";
      this.showCropper = false;

      // Эмитим событие изменения для v-model
      this.$emit("input", "");

      // Эмитим событие удаления изображения
      this.$emit("reset");
    },
  },
};
</script>

<style scoped>
.cropper-container {
  /* Фиксированная высота для контейнера обрезчика */
  height: 400px;
  background-color: #f5f5f5;
}

.cropper {
  height: 100%;
  width: 100%;
}
</style>

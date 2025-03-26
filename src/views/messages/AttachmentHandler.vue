<template>
  <div class="attachment-handler">
    <!-- Кнопка для загрузки файлов -->
    <v-btn
      icon
      variant="text"
      @click="$refs.fileInput.click()"
      :disabled="isUploading || disabled"
    >
      <v-icon>mdi-paperclip</v-icon>
    </v-btn>

    <!-- Скрытый input для выбора файлов -->
    <input
      ref="fileInput"
      type="file"
      @change="handleFileSelect"
      multiple
      accept="image/*,application/pdf,application/msword,application/vnd.ms-excel,text/plain,application/zip"
      class="d-none"
    />

    <!-- Предпросмотр выбранных файлов -->
    <div v-if="selectedFiles.length > 0" class="attachment-preview">
      <div class="d-flex flex-column">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="attachment-item d-flex align-center justify-space-between pa-2"
        >
          <div class="d-flex align-center">
            <v-icon
              :icon="getFileIcon(file)"
              size="small"
              class="mr-2"
            ></v-icon>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size text-caption text-grey-darken-1 ml-2">
              ({{ formatFileSize(file.size) }})
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            density="compact"
            size="small"
            @click="removeFile(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <v-progress-linear
      v-if="isUploading"
      indeterminate
      color="primary"
      class="mt-2"
    ></v-progress-linear>
  </div>
</template>

<script>
export default {
  name: "AttachmentHandler",

  props: {
    maxFiles: {
      type: Number,
      default: 5,
    },
    maxFileSize: {
      type: Number,
      default: 5 * 1024 * 1024, // 5MB
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedFiles: [],
      isUploading: false,
    };
  },

  methods: {
    handleFileSelect(event) {
      const files = Array.from(event.target.files);

      if (files.length === 0) return;

      // Проверка на максимальное количество файлов
      if (this.selectedFiles.length + files.length > this.maxFiles) {
        this.$emit(
          "error",
          `Ви можете прикріпити максимум ${this.maxFiles} файлів.`
        );
        event.target.value = ""; // Сбрасываем выбор
        return;
      }

      // Проверка размера каждого файла
      const oversizedFiles = files.filter(
        (file) => file.size > this.maxFileSize
      );
      if (oversizedFiles.length > 0) {
        this.$emit(
          "error",
          `Файл "${
            oversizedFiles[0].name
          }" занадто великий. Максимальний розмір файлу: ${this.formatFileSize(
            this.maxFileSize
          )}.`
        );
        event.target.value = ""; // Сбрасываем выбор
        return;
      }

      // Добавляем файлы
      this.selectedFiles = [...this.selectedFiles, ...files];

      // Оповещаем родительский компонент о выбранных файлах
      this.$emit("files-selected", this.selectedFiles);

      // Сбрасываем input, чтобы можно было выбрать тот же файл повторно
      event.target.value = "";
    },

    removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.$emit("files-selected", this.selectedFiles);
    },

    clearFiles() {
      this.selectedFiles = [];
      this.$emit("files-selected", this.selectedFiles);
    },

    setUploading(status) {
      this.isUploading = status;
    },

    getFileIcon(file) {
      const type = file.type || "";

      if (type.includes("image")) {
        return "mdi-file-image";
      } else if (type.includes("pdf")) {
        return "mdi-file-pdf-box";
      } else if (type.includes("word") || type.includes("document")) {
        return "mdi-file-word";
      } else if (type.includes("excel") || type.includes("spreadsheet")) {
        return "mdi-file-excel";
      } else if (
        type.includes("zip") ||
        type.includes("rar") ||
        type.includes("tar")
      ) {
        return "mdi-zip-box";
      } else if (type.includes("text")) {
        return "mdi-file-document-outline";
      } else {
        return "mdi-file-outline";
      }
    },

    formatFileSize(bytes) {
      if (!bytes) return "0 Байт";

      const k = 1024;
      const sizes = ["Байт", "КБ", "МБ", "ГБ"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
  },
};
</script>

<style scoped>
.attachment-preview {
  margin-top: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 4px;
  max-height: 150px;
  overflow-y: auto;
}

.attachment-item {
  border-radius: 4px;
  margin-bottom: 4px;
}

.attachment-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.file-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}
</style>

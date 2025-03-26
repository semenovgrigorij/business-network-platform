<template>
  <v-card class="chat-container d-flex flex-column" v-if="conversation">
    <!-- Заголовок чата -->
    <v-card-title class="chat-header d-flex align-center">
      <v-avatar size="40" color="primary" class="mr-3">
        <v-img v-if="contact && contact.avatar" :src="contact.avatar"></v-img>
        <span v-else class="text-white">{{ contactInitial }}</span>
      </v-avatar>

      <div>
        <div class="font-weight-bold">{{ contactName }}</div>
        <div class="text-caption" v-if="contact && contact.company">
          {{ contact.company }}
        </div>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        icon="mdi-information-outline"
        variant="text"
        @click="showContactInfo = true"
      ></v-btn>
    </v-card-title>
    <v-divider></v-divider>

    <!-- Сообщения -->
    <v-card-text
      class="chat-messages flex-grow-1 overflow-y-auto py-4"
      ref="messagesContainer"
    >
      <template v-if="loading">
        <div class="d-flex justify-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
      </template>

      <template v-else>
        <div v-if="messages.length === 0" class="text-center py-8">
          <p class="text-grey">Почніть спілкування, надіславши повідомлення</p>
        </div>

        <div v-else class="d-flex flex-column">
          <div
            v-for="(message, index) in messages"
            :key="message.id"
            class="message-wrapper mb-4"
            :class="{ 'my-message': message.senderId === currentUserId }"
          >
            <!-- Дата, если это первое сообщение или новый день -->
            <div
              v-if="shouldShowDate(message, index)"
              class="date-divider text-center my-4"
            >
              <div class="date-label">
                {{ formatMessageDate(message.timestamp) }}
              </div>
            </div>

            <div
              class="message"
              :class="{ 'my-message': message.senderId === currentUserId }"
            >
              <div class="message-content">
                <div class="message-text">{{ message.text }}</div>

                <!-- Отображение вложения, если есть -->
                <div v-if="message.attachment" class="message-attachment mt-2">
                  <v-btn
                    variant="outlined"
                    size="small"
                    :href="message.attachment.url"
                    target="_blank"
                  >
                    <v-icon small class="mr-1">mdi-file</v-icon>
                    {{ message.attachment.name }}
                  </v-btn>
                </div>

                <div class="message-time">
                  {{ formatMessageTime(message.timestamp) }}
                  <v-icon
                    v-if="message.senderId === currentUserId"
                    :icon="message.read ? 'mdi-check-all' : 'mdi-check'"
                    size="small"
                    :color="message.read ? 'primary' : ''"
                    class="ml-1"
                  ></v-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-card-text>

    <!-- Форма отправки сообщения -->
    <div class="chat-input px-4 py-3">
      <v-form @submit.prevent="sendMessage">
        <div class="d-flex flex-column">
          <!-- Предпросмотр загруженного файла, если есть -->
          <div v-if="uploadedFile" class="mb-2 pa-2 border rounded">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-file</v-icon>
              <span class="text-truncate">{{ uploadedFile.name }}</span>
              <v-spacer></v-spacer>
              <v-btn icon x-small @click="uploadedFile = null">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>

          <div class="d-flex align-center">
            <!-- Кнопка прикрепления файла -->
            <v-btn icon variant="text" @click="$refs.fileInput.click()">
              <v-icon>mdi-paperclip</v-icon>
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              style="display: none"
              @change="handleFileUpload"
            />

            <v-textarea
              v-model="newMessage"
              rows="1"
              auto-grow
              max-rows="4"
              hide-details
              placeholder="Напишіть повідомлення..."
              class="mr-2"
              variant="outlined"
              density="compact"
              @keydown.enter.prevent="sendMessage"
            ></v-textarea>

            <v-btn
              :disabled="!newMessage.trim() && !uploadedFile"
              icon="mdi-send"
              color="primary"
              @click="sendMessage"
            ></v-btn>
          </div>
        </div>
      </v-form>
    </div>

    <v-dialog v-model="showContactInfo" max-width="400">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Інформація про контакт</span>
          <v-btn icon variant="text" @click="showContactInfo = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text v-if="contact">
          <div class="d-flex flex-column align-center mb-4">
            <v-avatar size="80" color="primary" class="mb-3">
              <v-img v-if="contact.avatar" :src="contact.avatar"></v-img>
              <span v-else class="text-h4 text-white">{{
                contact.name.charAt(0)
              }}</span>
            </v-avatar>

            <div class="font-weight-bold">
              {{ contact && contact.name ? contact.name : `Контакт ${id}` }}
            </div>

            <h3 class="text-h6 text-center">{{ contact.name }}</h3>
            <p v-if="contact.company" class="text-subtitle-1 text-center">
              {{ contact.company }}
            </p>

            <div class="font-weight-bold">
              {{ contact && contact.name ? contact.name : `Контакт ${id}` }}
            </div>
          </div>

          <v-list>
            <v-list-item prepend-icon="mdi-email">
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{
                contact.email || "Не указан"
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item prepend-icon="mdi-phone">
              <v-list-item-title>Телефон</v-list-item-title>
              <v-list-item-subtitle>{{
                contact.phone || "Не указан"
              }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item prepend-icon="mdi-domain">
              <v-list-item-title>Компанія</v-list-item-title>
              <v-list-item-subtitle>{{
                contact.company || "Не указана"
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-btn
            block
            color="primary"
            variant="elevated"
            :to="`/businesses/${contact.id}`"
          >
            Перейти до профілю
          </v-btn>
        </v-card-actions>
      </v-card>

      <div class="message-text">{{ message.text }}</div>

      <!-- Отображение вложения, если есть -->
      <div v-if="message.attachment" class="message-attachment mt-2">
        <v-btn
          variant="outlined"
          size="small"
          :href="message.attachment.url"
          target="_blank"
        >
          <v-icon small class="mr-1">mdi-file</v-icon>
          {{ message.attachment.name }}
        </v-btn>
      </div>

      <div class="messages-time">
        {{ formatMessageTime(message.timestamp) }}
        <v-icon
          v-if="message.senderId === currentUserId"
          :icon="message.read ? 'mdi-check-all' : 'mdi-check'"
          size="small"
          :color="message.read ? 'primary' : ''"
          class="ml-1"
        ></v-icon>
      </div>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  name: "ConversationView",
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      conversation: null,
      messages: [],
      contact: null,
      newMessage: "",
      showContactInfo: false,
      currentUserId: "1", // ID текущего пользователя (в реальном приложении это будет из хранилища)
      uploadedFile: null,
      showTemplates: false,
      messageTemplates: [
        {
          title: "Привітання",
          text: "Доброго дня! Дякую за звернення до нашої компанії. Чим можу допомогти?",
        },
        {
          title: "Пропозиція співпраці",
          text: "Ми зацікавлені у співпраці з вашою компанією. Можемо запропонувати вигідні умови та індивідуальний підхід.",
        },
        {
          title: "Запит інформації",
          text: "Для подальшої роботи мені потрібна додаткова інформація. Чи могли б ви надати деталі щодо...",
        },
      ],
    };
  },
  watch: {
    contact: {
      handler(newContact) {
        console.log("Contact changed:", newContact);
      },
      deep: true,
    },
    id: {
      immediate: true,
      handler() {
        this.fetchConversation();
      },
    },
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true,
    },
  },
  methods: {
    async fetchConversation() {
      try {
        this.loading = true;
        console.log("Fetching conversation with ID:", this.id);

        // Проверим, является ли ID динамически созданным (conv-...)
        if (this.id.startsWith("conv-")) {
          // Получаем все беседы из Vuex
          const conversations =
            this.$store.getters["messages/allConversations"];
          console.log("All conversations from Vuex:", conversations);

          // Ищем нужную беседу по ID
          const foundConversation = conversations.find((c) => c.id === this.id);
          console.log("Found conversation:", foundConversation);

          if (foundConversation && foundConversation.contact) {
            // Используем найденные данные
            this.conversation = foundConversation;
            this.contact = foundConversation.contact;
            console.log(
              "Setting contact from found conversation:",
              this.contact
            );

            // Если есть сообщения, используем их
            if (
              foundConversation.messages &&
              foundConversation.messages.length > 0
            ) {
              this.messages = foundConversation.messages;
            } else {
              // Иначе пробуем получить сообщения отдельно
              try {
                const messages = await this.$store.dispatch(
                  "messages/fetchMessages",
                  this.id
                );
                if (messages && messages.length > 0) {
                  this.messages = messages;
                } else {
                  this.messages = [];
                }
              } catch (error) {
                console.error("Error fetching messages:", error);
                this.messages = [];
              }
            }

            this.loading = false;
            return;
          }
        }

        // Если не получилось найти беседу или это не динамическая беседа,
        // используем стандартные моковые данные
        console.log("Using standard mock data for ID:", this.id);

        // Ваши существующие моковые данные для ID 1, 2 и т.д.
        if (this.id === "1") {
          this.contact = {
            id: "2",
            name: "ЕкоФерма",
            company: "Органічні продукти харчування",
            email: "contact@ecofarm.ru",
            phone: "+38(050) 234-56-78",
            avatar: null,
          };

          this.messages = [
            // ваши моковые сообщения
          ];
        } else if (this.id === "2") {
          // код для другой беседы
        } else {
          // Для неизвестных ID создаем простой контакт
          console.log("Creating default contact for unknown ID:", this.id);
          this.contact = {
            id: this.id,
            name: `Контакт ${this.id}`,
            avatar: null,
            company: `Компанія ${this.id}`,
          };
          this.messages = [];
        }

        // Создаем объект беседы
        this.conversation = {
          id: this.id,
          contact: this.contact,
          unreadCount: 0,
        };

        console.log("Final contact data:", this.contact);
        console.log("Final conversation data:", this.conversation);
      } catch (error) {
        console.error("Error in fetchConversation:", error);

        // В случае ошибки создаем фиктивный контакт, чтобы не отображался undefined
        this.contact = {
          id: this.id,
          name: `Контакт ${this.id}`,
          avatar: null,
        };

        this.conversation = {
          id: this.id,
          contact: this.contact,
          unreadCount: 0,
        };
      } finally {
        this.loading = false;

        // Прокручиваем к последнему сообщению
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() && !this.uploadedFile) return;

      try {
        const messageText = this.newMessage.trim();
        this.newMessage = "";

        // Создаем объект для отправки сообщения
        let messageData = { text: messageText };

        // Если есть файл, добавляем его (в реальной ситуации здесь была бы загрузка)
        if (this.uploadedFile) {
          // В моковом варианте просто добавляем имя файла
          messageData.attachment = {
            name: this.uploadedFile.name,
            type: this.uploadedFile.type,
            // В реальной ситуации здесь был бы URL
            url: URL.createObjectURL(this.uploadedFile),
          };
          this.uploadedFile = null;
        }

        // Отправляем сообщение через Vuex
        // Но для мока просто добавляем в локальный массив
        const newMessage = {
          id: `new-${Date.now()}`,
          senderId: this.currentUserId,
          text: messageData.text,
          attachment: messageData.attachment,
          timestamp: new Date().toISOString(),
          read: false,
        };

        this.messages.push(newMessage);

        // Эмулируем ответ для демонстрации
        setTimeout(() => {
          if (this.id === "1") {
            this.messages.push({
              id: `response-${Date.now()}`,
              senderId: "2",
              text: "Дякую за повідомлення! Ми розглянемо вашу пропозицію.",
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }, 3000);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },

    // В store/modules/messages.js, добавьте действие

    formatMessageTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("uk-UK", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatMessageDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();

      // Сегодняшняя дата
      if (date.toDateString() === now.toDateString()) {
        return "Сьогодні";
      }

      // Вчерашняя дата
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Вчора";
      }

      // Другие даты
      return date.toLocaleDateString("uk-UK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    shouldShowDate(message, index) {
      if (index === 0) return true;

      const currentDate = new Date(message.timestamp).toDateString();
      const prevDate = new Date(
        this.messages[index - 1].timestamp
      ).toDateString();

      return currentDate !== prevDate;
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedFile = file;
      }
    },
    applyTemplate(template) {
      this.newMessage = template.text;
      this.showTemplates = false;
    },
  },
  computed: {
    contactName() {
      if (this.contact && this.contact.name) {
        return this.contact.name;
      }
      return `Контакт ${this.id}`;
    },

    contactInitial() {
      if (this.contact && this.contact.name) {
        return this.contact.name.charAt(0);
      }
      return "?";
    },
  },
};
</script>

<style scoped>
.chat-container {
  height: 70vh;
}

.chat-header {
  flex-shrink: 0;
}

.chat-messages {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.chat-input {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-wrapper.my-message {
  align-self: flex-end;
}

.message {
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #f5f5f5;
  position: relative;
}

.message.my-message {
  background-color: #e3f2fd;
  align-self: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-text {
  word-break: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  align-self: flex-end;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.date-divider {
  position: relative;
  margin: 16px 0;
  text-align: center;
}

.date-label {
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: #757575;
  display: inline-block;
}
</style>

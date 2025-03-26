<template>
  <v-card class="chat-container d-flex flex-column" v-if="conversation">
    <!-- Заголовок чата -->
    <v-card-title class="chat-header d-flex align-center">
      <v-avatar size="40" color="primary" class="mr-3">
        <v-img v-if="contact.avatar" :src="contact.avatar"></v-img>
        <span v-else class="text-white">{{ contact.name.charAt(0) }}</span>
      </v-avatar>

      <div>
        <div class="font-weight-bold">{{ contact.name }}</div>
        <div class="text-caption" v-if="contact.company">
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
        <div class="d-flex align-center">
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
            :disabled="!newMessage.trim()"
            icon="mdi-send"
            color="primary"
            @click="sendMessage"
          ></v-btn>
        </div>
      </v-form>
    </div>
  </v-card>

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

          <h3 class="text-h6 text-center">{{ contact.name }}</h3>
          <p v-if="contact.company" class="text-subtitle-1 text-center">
            {{ contact.company }}
          </p>
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
  </v-dialog>
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
      contact: {},
      newMessage: "",
      showContactInfo: false,
      currentUserId: "1", // ID текущего пользователя (в реальном приложении это будет из хранилища)
    };
  },
  watch: {
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

        // Имитация задержки загрузки данных
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // В реальном приложении здесь будет запрос к API

        // Тестовые данные контакта
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
            {
              id: "1",
              senderId: "1",
              text: "Привіт! Зацікавлений у співпраці з компанією.",
              timestamp: "2023-03-10T08:45:00Z",
              read: true,
            },
            {
              id: "2",
              senderId: "2",
              text: "Доброго дня! Дякую за інтерес. Яку саме співпрацю ви пропонуєте?",
              timestamp: "2023-03-10T09:30:00Z",
              read: false,
            },
          ];
        } else if (this.id === "2") {
          this.contact = {
            id: "3",
            name: "Буд-Майстер",
            company: "Будівництво та ремонт",
            email: "info@stroymaster.ua",
            phone: "+38 (099) 345-67-89",
            avatar: null,
          };

          this.messages = [
            {
              id: "1",
              senderId: "1",
              text: "Привіт! Нам потрібні будівельні матеріали для ремонту офісу. Можете зробити комерційну пропозицію?",
              timestamp: "2023-03-08T10:20:00Z",
              read: true,
            },
            {
              id: "2",
              senderId: "3",
              text: "Привіт! Звісно, ​​ми можемо підготувати для вас КП. Для цього нам потрібно знати приблизний обсяг робіт та перелік необхідних матеріалів.",
              timestamp: "2023-03-08T11:05:00Z",
              read: true,
            },
            {
              id: "3",
              senderId: "1",
              text: "У нас є офіс 120 кв.м. Потрібні матеріали для косметичного ремонту: фарба, шпалери, ламінат, плінтус.",
              timestamp: "2023-03-08T13:30:00Z",
              read: true,
            },
            {
              id: "4",
              senderId: "3",
              text: "Зрозумів вас. Підготуємо КП протягом 2 днів. Також можемо запропонувати послуги з ремонту.",
              timestamp: "2023-03-09T09:15:00Z",
              read: true,
            },
            {
              id: "5",
              senderId: "1",
              text: "Дякую! Чекатимемо КП. Щодо послуг ремонту поки не вирішили, але цікаво дізнатися про вартість.",
              timestamp: "2023-03-09T10:45:00Z",
              read: true,
            },
            {
              id: "6",
              senderId: "3",
              text: "Ми можемо запропонувати вам знижку 10% на перше замовлення матеріалів.",
              timestamp: "2023-03-09T14:15:00Z",
              read: true,
            },
          ];
        } else {
          // Если ID не соответствует известным разговорам, создаем пустой разговор
          this.contact = {
            id: this.id,
            name: `Контакт ${this.id}`,
            avatar: null,
          };

          this.messages = [];
        }

        this.conversation = {
          id: this.id,
          contact: this.contact,
          unreadCount: 0,
        };

        // Прокручиваем к последнему сообщению
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        this.loading = false;
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;

      try {
        const messageText = this.newMessage.trim();
        this.newMessage = "";

        // Создание нового сообщения
        const newMessage = {
          id: `new-${Date.now()}`,
          senderId: this.currentUserId,
          text: messageText,
          timestamp: new Date().toISOString(),
          read: false,
        };

        // Добавляем сообщение в список
        this.messages.push(newMessage);

        // Имитация задержки отправки
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Обновляем статус сообщения после "отправки"
        const messageIndex = this.messages.findIndex(
          (m) => m.id === newMessage.id
        );
        if (messageIndex >= 0) {
          this.messages[messageIndex] = {
            ...newMessage,
            id: `${Date.now()}`, // Реальный ID от сервера
          };
        }

        // Имитация ответа для демонстрации
        setTimeout(() => {
          if (this.id === "1") {
            this.messages.push({
              id: `response-${Date.now()}`,
              senderId: "2",
              text: "Ми відкриті для різних форм співпраці. Можемо обговорити оптові поставки наших продуктів чи спільні маркетингові акції.",
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }, 3000);
      } catch (error) {
        console.error("Error sending message:", error);
        alert(
          "Не вдалося надіслати повідомлення. Будь ласка, спробуйте ще раз."
        );
      }
    },
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

<!-- src/views/messages/ConversationView.vue -->
<template>
  <v-card class="chat-container" flat>
    <v-toolbar flat dense v-if="conversation">
      <v-toolbar-title>
        {{ recipientName }}
      </v-toolbar-title>
    </v-toolbar>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
    ></v-progress-linear>

    <template v-if="conversation">
      <!-- Сообщения -->
      <div ref="messagesContainer" class="messages-container pa-4">
        <template v-if="messages.length > 0">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper"
            :class="{ 'message-outgoing': isOutgoing(message) }"
          >
            <div class="message" :class="{ outgoing: isOutgoing(message) }">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">
                {{ formatMessageTime(message.createdAt) }}
                <v-icon
                  v-if="isOutgoing(message)"
                  x-small
                  :color="message.read ? 'primary' : ''"
                >
                  mdi-check-all
                </v-icon>
              </div>
            </div>
          </div>

          <div ref="messagesEnd"></div>
        </template>

        <div v-else class="text-center my-4">
          <v-icon large color="grey lighten-1">mdi-chat-outline</v-icon>
          <p class="text-subtitle-1 grey--text mt-2">Розпочніть бесіду</p>
        </div>
      </div>

      <!-- Форма отправки сообщения -->
      <div class="message-form pa-2">
        <v-textarea
          v-model="newMessage"
          placeholder="Введіть повідомлення..."
          auto-grow
          rows="1"
          hide-details
          @keydown.enter.prevent="sendMessageHandler"
        ></v-textarea>

        <v-btn
          icon
          color="primary"
          class="ml-2"
          :disabled="!newMessage.trim()"
          @click="sendMessageHandler"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </template>

    <div v-else-if="!isLoading" class="text-center pa-4">
      <v-icon large color="grey lighten-1">mdi-chat-remove-outline</v-icon>
      <p class="text-subtitle-1 grey--text mt-2">
        Оберіть бесіду зі списку або почніть нову
      </p>
    </div>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      newMessage: "",
      scrollToBottom: true,
    };
  },

  computed: {
    ...mapGetters(["isLoading"]),
    ...mapGetters("auth", ["currentUser"]),
    ...mapGetters("messages", [
      "currentConversation",
      "getConversationById",
      "conversationMessages",
    ]),
    conversation() {
      return this.getConversationById(this.id);
    },

    messages() {
      return this.conversationMessages;
    },

    recipientName() {
      if (!this.conversation || !this.currentUser) return "";

      // Проверяем наличие participants
      if (
        this.conversation.participants &&
        Array.isArray(this.conversation.participants)
      ) {
        const recipient = this.conversation.participants.find(
          (p) => p.id !== this.currentUser.id
        );

        if (recipient) {
          return `${recipient.firstName || ""} ${
            recipient.lastName || ""
          }`.trim();
        }
      }

      // Fallback на recipient, если participants отсутствует
      if (this.conversation.recipient) {
        return `${this.conversation.recipient.firstName || ""} ${
          this.conversation.recipient.lastName || ""
        }`.trim();
      }

      return "Чат";
    },
  },

  watch: {
    id: {
      immediate: true,
      handler(newId, oldId) {
        if (newId && newId !== oldId) {
          this.loadConversation();
        }
      },
    },

    messages() {
      this.$nextTick(() => {
        if (this.scrollToBottom) {
          this.scrollToBottomOfChat();
        }
      });
    },
  },

  methods: {
    ...mapActions("messages", [
      "fetchConversationById",
      "fetchMessages",
      "sendMessage",
      "setCurrentConversation",
    ]),

    async loadConversation() {
      try {
        if (!this.id) return; // Используем this.id вместо conversationId

        console.log("Loading conversation:", this.id);

        // Загружаем беседу из API
        await this.fetchConversationById(this.id);

        // Загружаем сообщения
        await this.fetchMessages(this.id);

        this.$nextTick(() => {
          this.scrollToBottomOfChat();
        });
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    },

    isOutgoing(message) {
      if (!this.currentUser) return false;

      // Обрабатываем разные форматы senderId
      const senderId =
        typeof message.senderId === "object"
          ? message.senderId.id
          : message.senderId;

      return senderId === this.currentUser.id;
    },

    formatMessageTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    async sendMessageHandler() {
      if (!this.newMessage.trim()) return;

      try {
        await this.sendMessage({
          conversationId: this.id,
          text: this.newMessage.trim(),
        });

        this.newMessage = "";
        this.scrollToBottom = true;
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },

    scrollToBottomOfChat() {
      if (this.$refs.messagesEnd) {
        this.$refs.messagesEnd.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 190px);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.message-wrapper {
  margin-bottom: 8px;
  display: flex;
}

.message-outgoing {
  justify-content: flex-end;
}

.message {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f5f5f5;
  position: relative;
}

.message.outgoing {
  background-color: #e3f2fd;
}

.message-text {
  margin-bottom: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #757575;
  text-align: right;
}

.message-form {
  display: flex;
  align-items: flex-end;
  padding: 8px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
}
</style>

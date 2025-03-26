<!-- src/views/messages/ConversationsView.vue -->
<template>
  <v-container>
    <h1>Повідомлення</h1>

    <v-row>
      <!-- Список бесед -->
      <v-col cols="12" md="4">
        <v-card>
          <v-toolbar dense flat>
            <v-toolbar-title>Бесіди</v-toolbar-title>
          </v-toolbar>

          <v-divider></v-divider>

          <v-progress-linear
            v-if="isLoading"
            indeterminate
            color="primary"
          ></v-progress-linear>

          <v-list v-if="conversations && conversations.length > 0">
            <v-list-item
              v-for="conversation in conversations"
              :key="conversation.id"
              :to="{ name: 'Conversation', params: { id: conversation.id } }"
              :class="{
                'primary lighten-4': isActiveConversation(conversation),
              }"
            >
              <v-list-item-avatar>
                <v-img :src="getRecipientAvatar(conversation)"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  {{ getRecipientName(conversation) }}
                </v-list-item-title>

                <v-list-item-subtitle class="text-truncate">
                  {{
                    conversation.lastMessage
                      ? conversation.lastMessage.text
                      : "Немає повідомлень"
                  }}
                </v-list-item-subtitle>

                <v-list-item-subtitle class="text-caption">
                  {{
                    formatDate(
                      conversation.lastMessage
                        ? conversation.lastMessage.createdAt
                        : conversation.createdAt
                    )
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action v-if="isUnread(conversation)">
                <v-badge dot color="primary"></v-badge>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <div v-else-if="!isLoading" class="text-center pa-4">
            <v-icon large color="grey lighten-1">mdi-chat-outline</v-icon>
            <p class="text-subtitle-1 grey--text mt-2">
              У вас поки що немає бесід
            </p>
          </div>
        </v-card>
      </v-col>

      <!-- Чат с сообщениями или заглушка -->
      <v-col cols="12" md="8">
        <router-view></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapGetters(["isLoading", "currentUser"]),
    ...mapGetters("messages", ["conversations", "currentConversation"]),

    conversations() {
      return this.allConversations;
    },
  },

  created() {
    this.fetchConversations();
  },

  methods: {
    ...mapActions("messages", ["fetchConversations"]),

    isActiveConversation(conversation) {
      return (
        this.currentConversation &&
        conversation.id === this.currentConversation.id
      );
    },

    getRecipientName(conversation) {
      if (!this.currentUser || !conversation || !conversation.participants)
        return "";

      const recipient = conversation.participants.find(
        (p) => p.id !== this.currentUser.id
      );

      return recipient ? `${recipient.firstName} ${recipient.lastName}` : "";
    },

    getRecipientAvatar(conversation) {
      if (!this.currentUser || !conversation || !conversation.participants)
        return "";

      const recipient = conversation.participants.find(
        (p) => p.id !== this.currentUser.id
      );

      return recipient && recipient.avatar
        ? recipient.avatar
        : "/images/placeholders/user-avatar.jpg";
    },

    isUnread(conversation) {
      if (!this.currentUser || !conversation || !conversation.lastMessage)
        return false;

      return (
        conversation.lastMessage.senderId !== this.currentUser.id &&
        !conversation.lastMessage.read
      );
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Вчора";
      } else {
        return date.toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "short",
        });
      }
    },
  },
};
</script>

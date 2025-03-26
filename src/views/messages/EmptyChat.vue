<template>
  <v-card
    flat
    style="height: calc(100vh - 190px)"
    class="d-flex align-center justify-center"
  >
    <div class="text-center">
      <v-icon size="64" color="grey lighten-1">mdi-chat-outline</v-icon>
      <h3 class="text-h5 mt-4 grey--text text--darken-1">Виберіть бесіду</h3>
      <p class="text-body-1 grey--text">або почніть нову</p>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "EmptyConversation",
};
</script>

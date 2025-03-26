<template>
  <div>Redirecting to RegisterView...</div>
</template>

<script>
export default {
  name: "RegisterRedirect",
  created() {
    console.warn(
      "Using deprecated Register.vue component. Please use RegisterView.vue instead."
    );
    if (this.$router) {
      this.$router.replace("/register");
    }
  },
};
</script>

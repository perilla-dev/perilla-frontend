<template>
  <v-container />
</template>

<script>
export default {
  name: 'Logout',
  mounted() {
    this.$store.commit('logout')
    this.$router.push('/')
  }
}
</script>

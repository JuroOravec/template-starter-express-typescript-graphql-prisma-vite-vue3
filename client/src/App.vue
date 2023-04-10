<template>
  <v-app>
    <v-main>
      <Login/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import NotionTasksPanel from './components/NotionTasksPanel.vue'
import Login from './components/Login.vue'

export default {
  name: 'App',
  components: {
    Login,
  },
}
</script>

<style lang="scss">
:root {
  // See https://stackoverflow.com/questions/46522331/scroll-bar-in-the-main-section-of-a-v-app
  overflow-y: auto !important;
}
</style>

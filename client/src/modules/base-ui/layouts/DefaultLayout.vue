<template>
  <v-layout class="DefaultLayout">
    <v-app-bar color="teal-darken-4">
      <template v-slot:image>
        <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>

      <template v-slot:prepend>
        <div class="pl-4 d-flex align-center" style="gap: 20px">
          <v-app-bar-title class="pt-1">
            <NuxtLink to="/"> LOGO </NuxtLink>
          </v-app-bar-title>
          <v-app-bar-nav-icon />
        </div>
      </template>

      <v-spacer></v-spacer>
    </v-app-bar>

    <div style="max-width: 1300px; margin: auto">
      <v-main style="height: 100vh; position: relative; display: flex; flex-direction: column">
        <v-container style="flex: auto">
          <slot />
        </v-container>
        <v-footer style="flex-grow: 0">
          <div class="px-4 py-2 bg-black text-center w-100">
            {{ new Date().getFullYear() }} — <strong>{{ props.siteName }}</strong>
          </div>
        </v-footer>
      </v-main>
    </div>
  </v-layout>
</template>

<script setup lang="ts">
import { useDefaults } from 'vuetify';

const _props = defineProps({ siteName: String });
const props = useDefaults(_props, 'DefaultLayout') as typeof _props;
</script>

<template>
  <!-- See https://nuxt.com/docs/guide/directory-structure/layouts -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Global modal instance -->
  <Modal />
</template>

<script setup lang="ts">
import { provideApolloClients } from '@vue/apollo-composable';

import { useJobs } from '../lib/jobs';
import { homeJobs } from '../modules/home/jobs';
import { useHomeModal } from '../modules/home/composables/useHomeModal';

// NOTE: For some reason the Vue apollo plugin doesn't do it for us
const { clients } = useApollo(); // eslint-disable-line no-undef
provideApolloClients(clients ?? {});

// Initialize modal state
// NOTE: Since we use useHomeModal, we don't have to call useComponentQueue()
const modal = useHomeModal();

// See https://nuxt.com/docs/migration/meta/#migration
useHead({
  title: 'Example web',
  link: [
    // See how to add fonts https://reactgo.com/nuxt-add-fonts/
    {
      // https://fonts.google.com/specimen/Overpass?query=overpass
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Overpass&display=swap',
    },
    {
      // https://fonts.google.com/specimen/Secular+One
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Secular+One&display=swap',
    },
    {
      // https://fonts.google.com/specimen/Roboto
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
    },
  ],
  script: [
    {
      // Set up Paddle - See https://developer.paddle.com/getting-started/39437d80612f3-import-the-paddle-js-library
      src: 'https://cdn.paddle.com/paddle/paddle.js',
    },
  ],
  // meta: [{
  //   name: 'description',
  //   content: 'This is my page description.'
  // }],
});

useTrackPage();

// Initialize periodical jobs
if (process.client) {
  useJobs({
    jobs: [...homeJobs],
    args: { modal, router: useRouter() },
  });
}
</script>

<style lang="scss">
@import './main.scss';
</style>

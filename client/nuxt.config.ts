// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // We split the nuxt project into semantically meaningful "sub-projects"
  extends: ['./src/modules/home'],
  srcDir: './src/main', // Entry-point
  serverDir: './src/server',
});

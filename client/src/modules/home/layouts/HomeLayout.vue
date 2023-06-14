<template>
  <v-layout
    class="HomeLayout"
    :class="{ md: display.width.value > 500, lg: display.width.value >= 750 }"
  >
    <v-app-bar :elevation="0">
      <template v-slot:prepend>
        <div class="pl-4 d-flex align-center" style="gap: 20px">
          <v-app-bar-title class="pt-1">
            <Linkable to="/"> LOGO1 </Linkable>
          </v-app-bar-title>
          <v-app-bar-nav-icon ref="navIcon" class="nav-icon" @click="() => (drawer = !drawer)" />
        </div>
      </template>

      <div class="nav">
        <Linkable
          v-for="{ to, title, hideOnMd } in nav"
          :to="to"
          class="nav-link"
          active-class="nav-link-active"
          :class="{ 'nav-hide-md': hideOnMd }"
          tabindex="0"
        >
          {{ title }}
        </Linkable>
      </div>
      <v-spacer />
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="top" temporary :scrim="false">
      <v-list
        v-click-outside="{
          handler: () => (drawer = false),
          // Allow to close only if we 1) didn't click on toggle btn, and 2) drawer is open
          closeConditional: (e: any) => !e.target?.closest('.nav-icon') && drawer,
        }"
        :items="navforDrawer"
        density="compact"
        item-value="to"
      />
    </v-navigation-drawer>

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
import { useDefaults, useDisplay } from 'vuetify';
import type { ComponentPublicInstance } from 'vue';

import { homeRoutes } from '../router';

const _props = defineProps({ siteName: String });
const props = useDefaults(_props, 'DefaultLayout') as typeof _props;

const display = useDisplay();

const drawer = ref(false);
const navIcon = ref<ComponentPublicInstance | null>(null);

watch(display.width, (newW) => {
  if (newW >= 750 && drawer.value) drawer.value = false;
});

const nav = [
  { to: homeRoutes.pricing.path, title: 'Pricing' },
  { to: homeRoutes.about.path, title: 'About Us', hideOnMd: true },
] satisfies { to: string; title: string; hideOnMd?: boolean }[];

const navforDrawer = nav.map((n) => ({ ...n, props: { to: n.to } }));
</script>

<style lang="scss">
.HomeLayout {
  .nav {
    display: none;
    gap: 20px;
    padding: 0 16px;
  }

  .nav-link {
    font-weight: bold;
    border-bottom: unset;
    padding-bottom: 2px;
    padding-top: 5px;

    &.nav-link-active {
      border-bottom: 2px solid;
      padding-bottom: 0;
    }

    &:hover {
      border-bottom: 2px solid;
      padding-bottom: 0;
    }
  }

  .nav-hide-md {
    display: none;
  }
}

.HomeLayout.md {
  .nav {
    display: flex;
    padding: 0 24px;
  }
}

.HomeLayout.lg {
  .nav {
    padding: 0 48px;
  }
  .nav-icon {
    display: none;
  }
  .nav-hide-md {
    display: inherit;
  }
}
</style>

<template>
  <v-layout
    class="DefaultLayout"
    :class="{ md: display.width.value > 500, lg: display.width.value >= 750 }"
  >
    <v-app-bar :elevation="0">
      <template v-slot:prepend>
        <div class="pl-4 d-flex align-center" style="gap: 20px">
          <v-app-bar-title class="pt-1">
            <CLink :to="homeLink">
              <slot name="logo" v-bind="{ isDrawerOpen }">
                {{ siteName }}
              </slot>
            </CLink>
          </v-app-bar-title>
          <v-app-bar-nav-icon
            ref="navIcon"
            class="nav-icon"
            @click="() => (isDrawerOpen = !isDrawerOpen)"
          />
        </div>
      </template>

      <div class="nav">
        <template v-for="item in nav">
          <slot name="nav-item" v-bind="{ item, isDrawerOpen }">
            <CLink
              :to="item.to"
              class="nav-link"
              active-class="nav-link-active"
              :class="{ 'nav-hide-md': item.hideOnMd }"
              tabindex="0"
            >
              {{ item.title }}
            </CLink>
          </slot>
        </template>
      </div>

      <v-spacer />
    </v-app-bar>

    <v-navigation-drawer v-model="isDrawerOpen" location="top" temporary :scrim="false">
      <slot
        name="nav-drawer"
        v-bind="{ items: navforDrawer, isDrawerOpen, onClickOutside: closeDrawer }"
      >
        <v-list
          v-click-outside="{
            handler: closeDrawer,
            // Allow to close only if we 1) didn't click on toggle btn, and 2) drawer is open
            closeConditional: (e: any) => !e.target?.closest('.nav-icon') && isDrawerOpen,
          }"
          :items="navforDrawer"
          density="compact"
          item-value="to"
        />
      </slot>
    </v-navigation-drawer>

    <div style="max-width: 1300px; margin: auto">
      <v-main style="height: 100vh; position: relative; display: flex; flex-direction: column">
        <v-container style="flex: auto">
          <slot v-bind="{ isDrawerOpen }" />
        </v-container>

        <v-footer class="footer">
          <slot name="footer-prepend" v-bind="{ isDrawerOpen }" />
          <div class="px-4 py-2 bg-black text-center w-100">
            {{ new Date().getFullYear() }} — <strong>{{ props.siteName }}</strong>
          </div>
          <slot name="footer-append" v-bind="{ isDrawerOpen }" />
        </v-footer>
      </v-main>
    </div>
  </v-layout>
</template>

<script setup lang="ts" generic="TNav extends LayoutNavItem = LayoutNavItem">
import { useDefaults, useDisplay } from 'vuetify';
import type { ComponentPublicInstance } from 'vue';

import type { LayoutNavItem, LayoutDrawerNavItem } from '../types';

defineSlots<{
  default?: (props: { isDrawerOpen: boolean }) => void;
  'nav-item'?: (props: { item: TNav; isDrawerOpen: boolean }) => void;
  'nav-drawer'?: (props: {
    items: LayoutDrawerNavItem<TNav>[];
    isDrawerOpen: boolean;
    onClickOutside: () => void;
  }) => void;
  logo?: (props: { isDrawerOpen: boolean }) => void;
  'footer-prepend'?: (props: { isDrawerOpen: boolean }) => void;
  'footer-append'?: (props: { isDrawerOpen: boolean }) => void;
}>();
const _props = defineProps<{
  siteName?: string;
  homeLink?: string;
  nav: TNav[];
}>();
const props = useDefaults(_props, 'DefaultLayout') as typeof _props;
const { homeLink, nav } = toRefs(props);

const display = useDisplay();

const isDrawerOpen = ref(false);
const navIcon = ref<ComponentPublicInstance | null>(null);

const navforDrawer = computed(() => {
  return nav.value.map((n) => ({
    ...n,
    props: { to: n.to },
  })) satisfies LayoutDrawerNavItem<TNav>[];
});

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

watch(display.width, (newW) => {
  if (newW >= 750 && isDrawerOpen.value) closeDrawer();
});
</script>

<style lang="scss">
.DefaultLayout {
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

  .footer {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    padding: 0;
    margin-top: 64px;
  }
}

.DefaultLayout.md {
  .nav {
    display: flex;
    padding: 0 24px;
  }
}

.DefaultLayout.lg {
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

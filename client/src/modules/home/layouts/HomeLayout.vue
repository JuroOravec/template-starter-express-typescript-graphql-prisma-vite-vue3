<template>
  <DefaultLayout
    class="HomeLayout"
    :nav="nav"
  >
    <template #logo>
      THE LOGO
    </template>
    <template #default>
      <slot />
    </template>
    <template #footer-prepend>
      <div style="background-color: black; color: white; width: 100%;">
        <div class="d-flex text-caption justify-center pt-2" style="gap: 16px;">
          <Linkable v-for="item in footerLegal" :key="item.title" color="white" :to="item.link" :underline="false" @click="item.onClick">
            {{ item.title }}
          </Linkable>
        </div>
      </div>
    </template>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { openConsentPrefs } from '@/../datasources/termly/endpoints/consent';
import type { LayoutNavItem } from '../../base-ui/types';
import DefaultLayout from '../../base-ui/layouts/DefaultLayout.vue';
import { homeRoutes } from '../router';
import { legalRoutes } from '../../base-legal/router';

const nav = [
  { to: homeRoutes.pricing.path, title: 'Pricing' },
  { to: homeRoutes.about.path, title: 'About Us', hideOnMd: true },
] satisfies LayoutNavItem[];

const footerLegal = [
  { title: 'Privacy Policy', link: legalRoutes['privacy-policy'].path },
  { title: 'Terms of Use', link: legalRoutes['terms-of-use'].path },
  { title: 'Disclaimer', link: legalRoutes['disclaimer'].path },
  { title: 'Cookie Policy', link: legalRoutes['cookie-policy'].path },
  { title: 'Cookie Policy', onClick: openConsentPrefs },
] satisfies ({ title: string } & ({ link: string; } | { onClick: () => void }))[];
</script>

<style lang="scss">
.HomeLayout {
}
</style>
<template>
  <v-table density="compact" class="PolicyCookieDetail">
    <tbody>
      <tr v-for="(val, key) in cookie">
        <td>{{ formatHeader(key) }}</td>
        <td v-if="(key === 'service' && typeof val !== 'string')" >
          {{ val.name }}
  
          <template v-if="val.policyUrl">
            (<Linkable :to="val.policyUrl">View Service Privacy Policy</Linkable>)
          </template>
        </td>
        <td v-else>
          {{ val }}
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import capitalize from 'lodash/capitalize';

import type { PolicyCookie } from '../types';

defineProps<{ cookie: PolicyCookie }>();

const headers: Partial<Record<keyof PolicyCookie, string>> = {
  expiry: 'Expires in',
};

const formatHeader = (prop: keyof PolicyCookie) => headers[prop] ?? capitalize(prop);
</script>

<style lang="scss">
.PolicyCookieDetail {
}
</style>

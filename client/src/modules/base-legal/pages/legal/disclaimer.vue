<template>
  <div class="Disclaimer">
    <h1 class="text-h4 py-8">DISCLAIMER</h1>
    <div class="text-body-1 font-weight-bold">
      Last updated
      <span>{{ format(dateLastUpdate, 'do MMM yyyy') }}</span>
    </div>

    <h3 class="text-h6">WEBSITE DISCLAIMER</h3>

    <div>
      The information provided by
      {{ config.legalCompanyName }}
      (<CEnum :items="['Company', 'we', 'us', 'our']">
        <template #="{ item }">
          <strong>"{{ item }}"</strong>
        </template>
      </CEnum>)
      on {{ config.sitePublicUrl }}
      (the "Site") and our mobile application is for general informational purposes only. All information on the Site and our mobile application is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site or our mobile application. UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR OUR MOBILE APPLICATION OR RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE AND OUR MOBILE APPLICATION. YOUR USE OF THE SITE AND OUR MOBILE APPLICATION AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE AND OUR MOBILE APPLICATION IS SOLELY AT YOUR OWN RISK.
    </div>

    <!-- <div>
      This cookie policy was created using Termly's
      <CLink to="https://termly.io/products/disclaimer-generator/">
        Disclaimer Generator </CLink
      >.
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

import { legalRoutes } from '../../router';
import { config } from '@/../globals/config';

definePageMeta(legalRoutes['disclaimer']);

const dateLastUpdate = new Date('2023-06-16');
</script>

<style lang="scss">
.Disclaimer {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3, h2 {
    padding-top: 24px;
    font-weight: bold;
  }
}
</style>

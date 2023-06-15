<template>
  <div
    class="Products"
    :class="{
      md: containerWidth && containerWidth >= 465,
    }"
    ref="containerEl"
    v-resize="onResize"
  >
    <div v-for="product in products" class="product text-body-2">
      <div class="product-info pb-2">
        <div class="text-h6 font-weight-bold">{{ product.name }}</div>
        <div>{{ product.description }}</div>
      </div>

      <div class="product-controls">
        <div class="product-quant">
          <div class="text-body-1">
            {{ formatPrice(product.priceInCents / 100, product.currency) }}
          </div>
          <div class="product-quant-input">
            <v-icon
              icon="mdi:mdi-minus"
              color="black"
              @click="() => cart.adjust(product.productId, -1)"
            />
            <FormInputNum
              :model-value="cart.get(product.productId)"
              @update:model-value="(val) => cart.set(product.productId, val)"
              min="0"
              density="compact"
              style="width: 75px"
            />
            <v-icon
              icon="mdi:mdi-plus"
              color="black"
              @click="() => cart.adjust(product.productId, 1)"
            />
          </div>

          <div class="d-flex flex-grow-1 justify-end">
            <div class="text-body-1">
              Total:
              {{ formatPrice(cart.get(product.productId) * product.priceInCents / 100, product.currency) }}
            </div>
          </div>
        </div>

        <div class="product-controls">
          <VBtnPrimary
            class="px-4"
            :disabled="cart.get(product.productId) < 1"
            @click="onCheckout(product.productId)"
          >
            Buy {{ cart.get(product.productId) }}
          </VBtnPrimary>
          <VBtnSecondary
            :color="cart.get(product.productId) < 1 ? '#aaa' : '#E75B5B'"
            error
            :disabled="cart.get(product.productId) < 1"
            @click="() => cart.set(product.productId, 0)"
            style="padding: 8px 10px !important; width: fit-content; min-width: auto;"
          >
            <v-icon
              aria-label="Clear product quantity"
              icon="mdi:mdi-delete"
              size="18"
            />
          </VBtnSecondary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { openCheckout } from '@/../datasources/paddle/endpoints/checkout';
import { numObjRef } from '../utils/numObjRef';
import { useHomeModal } from '../composables/useHomeModal';

// TODO - fetch data from server
const products = computed(() => [
  {
    currency: 'USD',
    description: 'PRODUCT DESCRIPTION ABOUT WHAT IT DOES AND WHAT IT WILL DO',
    iconUrl: null,
    name: 'Super cool product',
    priceInCents: 9000,
    productId: '12345',
  },
  {
    currency: 'USD',
    description: 'PRODUCT DESCRIPTION ABOUT WHAT IT DOES AND WHAT IT WILL DO',
    iconUrl: null,
    name: 'One London pint',
    priceInCents: 2000,
    productId: '98765',
  },
]);

const modal = useHomeModal();

// Mapping of product ID to quantity
const cart = numObjRef({}, { defaultValue: 0, integer: true, min: 0 });

const getProductQuantities = (productIds: string[]) => {
  const newQuantities: Record<string, number> = {};
  productIds.forEach((productId) => {
    newQuantities[productId] = cart.get(productId);
  });
  cart.ref.value = newQuantities;
};

// When the list of products updates, keep the quantities info
// for only those products that were present both before and after
watch(
  products,
  (newProducts) => {
    const productIds = newProducts.map((p) => p.productId);
    getProductQuantities(productIds);
  },
  { immediate: true }
);

const isCheckoutOpen = ref(false);
const onCheckout = (productId: string) => {
  if (isCheckoutOpen.value) return;
  isCheckoutOpen.value = true;

  openCheckout({
    productId, 
    quantity: cart.get(productId) || 1, 
    onSuccess: (payload) => {
      modal.push({ name: 'checkoutSx', props: { payload } });
    },
  }).finally(() => (isCheckoutOpen.value = false));
};

///////////////////////////
// RESPONSIVE STYLING
///////////////////////////

const containerEl = ref<HTMLElement | null>(null);
const containerWidth = ref<number | null>(null);
const onResize = () => {
  containerWidth.value = containerEl.value?.getBoundingClientRect()?.width ?? null;
};
</script>

<style lang="scss">
.Products {
  display: flex;
  flex-direction: column;
  gap: 30px;

  .product-controls {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .product-quant {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;

    > * {
      white-space: nowrap;
    }

    .v-input {
      grid-template-rows: 30px;

      input {
        height: 30px !important;
        padding-top: 0;
        padding-bottom: 0;
        min-height: 30px;
      }
    }
  }

  .product-quant-input {
    display: flex;
    align-items: center;
    align-items: inherit;
    gap: 7px;
  }
}

.Products.md {
  width: 100%;
  max-width: 700px;

  .product-quant {
    width: unset;
  }
  .product-controls {
    flex-wrap: nowrap;
  }
}
</style>

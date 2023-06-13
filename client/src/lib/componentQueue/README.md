# Component queue

System-wide components like modals (AKA alerts or dialogs - windows that overlay content and prompt action from user), snackbars, etc,
are managed via `useComponentQueue` composable. It offers smart component management with:

- Component queue - There's always only one component open at any one time
- Send data to and from components - Pass data to components as props, and receive emitted data via Promise
- Sested components/flows - Components can open "child" components and work with the data emitted from the children

```ts
import { useComponentQueue } from '@/../lib/componentQueue';

const queue = useComponentQueue();
// ...
queue.push({ component: ModalScraperVoteCheckoutSx, props: { event } }).then((res) => ... );
```

## Named and type-safe components

For additional type safety, module-specific composables are defined. E.g `useHomeModal`
defines modals used in the `home` module, and also specifies the props, emits, and state
available to individual modals.

Example:

```ts
import type { Component } from 'vue';

import { ItemDef, createNamedUseComponentQueue } from '@/../lib/componentQueue';
import ModalCheckoutSx from './components/ModalCheckoutSx.vue';
import ModalMfaFail from './components/ModalMfaFail.vue';

// 1. Define types for props, emits, and state
type Modals = {
  checkoutSx: ItemDef<{ event: { a: 1, b: 2 } }>;
  mfaFail: ItemDef;
};

// 2. Define components
const modals = {
  checkoutSx: ModalCheckoutSx,
  mfaFail: ModalMfaFail,
} satisfies Record<keyof Modals, Component>;

// 3. Create composable
const useNamedModal = createNamedUseComponentQueue<Modals>(modals, { namespace: 'modal' });

// 4. Use same as `useComponentQueue` but with `name` instead of `component`
// NOTE: Incorrect `name` or `props` will trigger TypeScript error.
useNamedModal().push({ name: 'checkoutSx', props: { event: eventData } })
  .then((res) => ...);
```

## Create view component

The composable manages the state of components. However, we still need a way
to actually display the components!

The aim of `useComponentQueue` is that there would be a single Vue component that displays
the "component content".

See `Modal.vue` for the implementation. But in a nutshell, there's 2 steps to it:

1. Call `useComponentQueue` in top-level Vue component (e.g. `App.vue`).

   - `useComponentQueue` uses Vue's inject/provide to manage global state. Hence,
     calling `useComponentQueue` in top-level Vue component does 2 things:

     1. Initialize the state.
     2. Ensure that the state will be available to all components.

        This has to do with Vue mechanics, where provided values are available
        only to the component's _descendants_.
        So if we call `useComponentQueue` in a sub-component, only the sub-component's children will
        share the state of `useComponentQueue`.

        On other hand, you can use this to your advantage for advanced use cases, where, for example,
        different invocations of `useComponentQueue` should handle the displaying of components differently
        in different parts of the app.

2. Define a component that uses `currItem`, `childResult`, and `onItemDone` from `useComponentQueue`.

   - `currItem` includes the component and props that should be displayed.
   - `childResult` should be passed to the component so it can access data from `queue.createChild(...)`.
   - `onItemDone` is the callback that should be called when components emits `done` event.

## Create content component

Next step, then, is to create the "content" components. AKA the components that will be pushed to the
"component queue". Think of it e.g. as a specific modal instance, or specific snackbar.

Best practices for writing content components:

- Keep the name identifiable - E.g. all "modals" should start with "Modal" (e.g. "ModalCheckoutSuccess").
- Use `ItemDef2Props` and `ItemDef2Emits` to have the component well-typed and compliant with `useComponentQueue`.
- Always emit `done`. This is needed so that the "view component" knows when to stop displaying the component.

Example

Template

```vue
<template>
  <div>
    {{ event.product.quantity }} votes!
    <br />
    <v-btn @click="() => emit('done')"> Dismiss </v-btn>
  </div>
</template>
```

Script (`<script setup>`)

```ts
import type { ItemDef2Props, ItemDef2Emits } from '@/../lib/componentQueue';
import type { HomeModals } from '../composables/useHomeModal';

// Props and emits to work with useModal
type Modal = HomeModals['scraperVoteCheckoutSx'];
defineProps<ModalDef2Props<Modal> & {}>();
const emit = defineEmits<ModalDef2Emits<Modal> & {}>();
```

## Multiple instances

If you want to use `useComponentQueue` for multiple use cases (e.g. managing modals AND managing snackbars), then use the `namespace` option to create multiple separate content queues.

Example:

1. Initialize state
   `App.vue` (top-level component)

   ```ts
   // NOTE: Namespace doesn't make a differenec when `useComponentQueue`
   // is used only for stat initialization
   useComponentQueue();
   // Same as
   // useComponentQueue({ namespace: 'snackbar' });
   ```

2. Create view components

   `Modal.vue`

   ```ts
   const { currModal, childModalResult, onModalDone } = useComponentQueue({ namespace: 'modal' });
      // ...
   ```

   `Snackbar.vue`

   ```ts
   const { currModal, childModalResult, onModalDone } = useComponentQueue({ namespace: 'snackbar' });
   // ...
   ```

3. Push to distinct queues

   ```ts
   import SnackbarSuccess from './components/SnackbarSuccess.vue';
   import ModalQuestion from './components/ModalQuestion.vue';

   // First display modal with question
   useComponentQueue({ namespace: 'modal' })
     .push({ component: ModalQuestion, props: { a: 2 } })
     .then((res) => {
       // Then display a snackbar after question was answered
       return useComponentQueue({ namespace: 'snackbar' }).push({
         component: SnackbarSuccess,
         props: { a: 2 },
       });
     })
     .then((res) => {
       // Do something after snackbar is dismissed
     });
   ```

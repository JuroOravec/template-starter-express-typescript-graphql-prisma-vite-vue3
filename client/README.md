# Nuxt 3 Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

### Development Server

Start the development server on `http://localhost:3000`

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

### Deployment

1. Authenticate with Netlify

```bash
npm run netlify:login
```

2. Create preview deployment

```bash
npm run netlify:deploy
```

3. Check that everything works

4. If so, publish to prod

```bash
npm run netlify:deploy:prd
```

## Development

### Project structure

We use the [Nuxt extends option](https://nuxt.com/docs/examples/advanced/config-extends)
to split the app into smaller, semantically-meaningful "mini-projects".

```txt
<root>
|-- nuxt.config.ts - This is the main / entrypoint Nuxt config
|-- src
  |-- main - Client files related to <root>/nuxt.content.ts
  |-- server - Server files related to <root>/nuxt.content.ts
  |-- modules - Nuxt "mini-projects"
    |-- base-ui - UI-specific files shared by all modules
    |-- base-analytics - Analytics-specific files shared by all modules
    |-- ...
    |-- base - Bundles together all "base-*" modules + Other configs and files shared by all modules
    |-- moduleA - Module A (extends base module)
    |-- moduleB - Module B (extends base module)
    |-- ...
```

`nuxt.config.ts` dependencies:

```txt
     base-ui   base-analytics   ...   // Project-agnostic setup is in base-* modules
       |              |          |
       V              V          V
     ====== ./src/modules/base =====  // All base-* modules are unified in "base" module
       |              |          |
       V              V          V
     moduleA       moduleB      ...   // Project-specific modules extend "base"
       |              |          |
       V              V          V
     ======= ./nuxt.config.ts ======  // All modules are unified in top-level config
```

And as for the project structure inside each "module", this follows
the Nuxt project structure. See https://nuxt.com/docs/guide/directory-structure.

### Vue components

See [./src/modules/base/components/Linkable.vue](./src/modules/base/components/Linkable.vue)
as the example of writing [Vue 3 Components with setup script](https://vuejs.org/api/sfc-script-setup.html).

### Developer tooling (DX)

Project uses:

- ESLint
- Prettier
- Stylelint (not active)

### Modals

Modals (AKA alerts or dialogs - windows that overlay content and prompt action from user) are managed via `useComponentQueue` composable. It offers smart component management with:

- Component queue - There's always only one component open at any one time
- Send data to and from components - Pass data to components as props, are receive emitted result data via Promise
- Flows / nested components - Components can open "child" components and work with the data emitted from the children

```ts
import { useComponentQueue } from '@/..lib/componentQueue';

const queue = useComponentQueue({ namespace: 'modal' });
// ...
queue.push({ component: ModalScraperVoteCheckoutSx, props: { event } }).then((res) => ... );
```

For additional type safety, module-specific composables are defined. E.g `useHomeModal`
defines modals used in the `home` module, and also specifies the props, emits, and state
available to individual modals.

```ts
const modal = useHomeModal();
// Both `props` property and Promise result are properly typed
modal.push({ name: 'scraperVoteCheckoutSx', props: { event } }).then((res) => ... );
```

Read more in [componentQueue README](./src/lib/componentQueue/README.md).

### Forms

For us to use forms in web app projects, they need to be as easy to define as for example Google Forms, yet they need to be fully configurable, validate input, and provide robust typing support.

We've got all that thanks to our `useTypedform` composable.

Read more in [typedForm README](./src/lib/typedForm/README.md).

Here's example usage:

Vue template

```vue
<!-- FormSimple is a form renderer - It takes a list of fields, and renders it accordingly -->
<FormSimple
  v-bind="$attrs"
  :fields="formFields"
  :completed="formCompleted"
  @submit="onSubmit"
>
    <template #form-completed>
      <div>Thanks for the submission.</div>
    </template>
  </FormSimple>
```

Script

```ts
import { required, email, minLength, maxLength } from '@vuelidate/validators';

import {
  FormFieldToType,
  FormFieldList,
  createFormField,
} from '../../base-ui/composables/useForm';

// This type is defined so that the 'name' property on `createFormField` is inferred.
type FormFieldKey = 'firstName' | 'lastName' | 'email' | 'comments';

const formFields = [
  // Each field is defined using `createFormField` to ensure type safety, and
  // so that `FormFieldToType` can successfully infer the field type.
  //
  // The first argument (e.g. 'text') defined by us, and it decides:
  // 1. What type will the field value have
  // 2. What type is the `attrs` property
  // 3. What UI component will be used for this field
  createFormField('text', {
    // Unique name of the field. This defines how we can access the field value from
    // the form state, e.g. `state.firstName`
    name: 'firstName',
    // Attrs are passed to the UI component. Type of this property is inferred from the
    // field type (e.g. 'text').
    attrs: { label: 'First name', required: true },
    // Rules are passed to Vuelidate for automatic validation
    rules: { required, minLength: minLength(2) },
  }),
  createFormField('text', {
    name: 'lastName',
    attrs: { label: 'Last name', required: true },
    rules: { required, minLength: minLength(2) },
  }),
  createFormField('text', {
    name: 'email',
    attrs: { label: 'Email', required: true },
    rules: { required, email, minLength: minLength(6) },
    hint: `name@example.com`,
    postProcess: (s) => s?.replace(/\s+/, ''),
  }),
  // The form supports optional 1 level of nesting to signify that
  // the fields form together a group.
  // Form rendering components can use this, e.g. the `FormMultistep` component
  // is a stepper that shows each group as an individual page.
  [
    createFormField('number', {
      name: 'age',
      attrs: { label: 'Age' },
      rules: { maxLength: maxLength(3000) },
    }),
    createFormField('checkbox', {
      name: 'agreeToToS',
      attrs: { label: 'ToS' },
      rules: {},
    }),
  ],
  // The `satisfies` check ensures that the `name` property is typed.
] satisfies FormFieldList<FormFieldKey>;

// By using `FormFieldToType<typeof formFields>`, we get full type support
// for the form state object, while still keeping `formFields` as the source of truth.
const onSubmit = (payload: { state: FormFieldToType<typeof formFields> }) => {
  // ...

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: JSON.stringify({
      a: payload.state.firstName, // string | undefined
      b: payload.state.lastName, // string | undefined
      c: payload.state.email, // string | undefined
      d: payload.state.age, // number | undefined
      d: payload.state.agreeToToS, // boolean | undefined
    }),
  });
};
```

### Analytics

This project uses Mixpanel for usage analytics.

The analytics client is automatically initiated via Nuxt plugin.

It's also available as a composable. So the usage is as simple as

```ts
useAnalytics().trackEvent('eventName', { ... });
```

All events are fully typed.

### Error tracking

This project uses Sentry for error tracking.

Sentry is installed onto Vue, which should capture errors within Vue context.

If you need to call Sentry manually, then - just like the analytics lib - also Sentry
is available via `useNuxtApp`, as Vue global, and via `useErrorTracker`, so you can just use

```ts
useErrorTracker().captureException(Error('Error name'));
```

### Jobs

Sometimes, there is logic that is not bound to Vue component lifecycle, nor has a reliable way
to be initialized via Vue reactivity. Such logic may need
to run once, couple of times, until something happens, or periodically.

Jobs lib is a utility for managing such "jobs".

With this utility, we define the "jobs" - functions to be run at intervals.

The "jobs" run until they themselves signal that they are done. So they
run only when needed.

NOTE: Jobs are usually in the `jobs.ts` file / folder. This is a good place
to put one off or initialisation scripts that don't fit anywhere else.

Example:

```ts
// Thsi will run periodically until the Paddle client has been set up
const setupPaddleCheckout: Job<JobContext> = async (args, done) => {
  const Paddle = (globalThis as any).Paddle;
  if (!Paddle) return;

  if (config.paygatePaddleEnv !== 'prod') {
    Paddle.Environment.set(config.paygatePaddleEnv);
  }

  Paddle.Setup({ vendor: toInteger(config.paygatePaddleVendorId) });

  done();
};
```

In App.vue script

```ts
import { useJobs } from '@/../lib/jobs';

if (process.client) {
  useJobs({
    jobs: [...homeJobs],
    args: { modal, router: useRouter() },
  });
}
```

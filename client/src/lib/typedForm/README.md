# Typed form

The declarative and type safe form state management validated with Vuelidate.

## Rationale

I'm sure there's already so many libraries and solutions for frontend forms.

So why bother making another? Why bother at all, instead of using Google Forms?

Forms are used by users, so to provide an excellent user experience,
I want to make sure the forms used communicate and guide the users
as necessary.

Requirements:

- Form components for basic fields (text, number, email, etc...)
- Intuitive interaction
- Clear input error handling (validation)

However, if we're handling forms / user input in our project by ourselves
(AKA not using Google Forms), then there's one requirement that trumps them all:

- Creating / modifying forms and using data from the forms should be AT LEAST
  as fast and easy as using e.g. Google Forms.

I used Vuetify 3. This did the job on the UI end, but the UX and DX (Dev Exp) still
wasn't all perked out.

Fixing the UX was the easier step - I made project-specific components that sit on top of
Vuetify's form field components, and style them to our needs. That's components like:

- [FormInputCheckbox](../../modules/base-ui/components/FormInputCheckbox.vue)
- [FormInputNum](../../modules/base-ui/components/FormInputNum.vue)
- [FormInputText](../../modules/base-ui/components/FormInputText.vue)
- ...

However, making a form with 18 fields was still a pain. I had to:

- Update the UI for 18 fields
- Add validation to 18 fields
- Make reactive value for 18 fields
- Normalize and add defaults for 18 fields
- And if I wanted to make a difference to the underlying form, I would again have
  to update everything 18 times.

For that reason I made this library. This carries 2 issues:

- For the forms to have minimal overhead, they should be defined declaratively (Describing WHAT I want, not HOW)
- With declarative definition, I lose type safety

Hence, this library solves these 2 issues - form state can be defined declaratively with minimal overhead
while it still can infer field names and types.

## Usage

### Create a form

In the example below we create a new form. There's a single source of truth (`formFields`)
for the field names, types, validation, UI component, hints, and custom props passed to
the UI component.

`formFields` is also used to infer the type of the form's state in the `@submit` callback
using `FormFieldToType`.

Vue template

```vue
<!-- FormSimple is a form renderer - It takes a list of fields, and renders it accordingly -->
<FormSimple v-bind="$attrs" :fields="formFields" :completed="formCompleted" @submit="onSubmit">
    <template #form-completed>
      <div>Thanks for the submission.</div>
    </template>
  </FormSimple>
```

Script

```ts
import { required, email, minLength, maxLength } from '@vuelidate/validators';

import { FormFieldToType, FormFieldList, createFormField } from '../../base-ui/composables/useForm';

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

### Create a form renderer

In previous example, we used a mysterious `FormSimple` to render the form. So what is it
and what does it do? And how can you define your own form template?

Here's an abridged version of `FormSimple`. In a nutshell, it takes the fields, and renders
them one by one. And when the form is submitted, the form _state_ is emitted.

```vue
<template>
  <div class="FormSimple">
    <v-form v-bind="$attrs" @submit.prevent="onSubmit">
      <!-- Fields passed through `useTypedForm` are normalized to groups of fields -->
      <div v-for="(formGroup, index) in formGroups">
        <template v-for="field in formGroup" :key="field.name">
          <!--
          Another magical component, this is our helper component that decides which
          Vuetify input component to use based on the "type" attribute.
          -->
          <FormField v-bind="buildFieldAttrs(field)" />
        </template>
      </div>
    </v-form>
  </div>
</template>
```

```ts
import type { Validation } from '@vuelidate/core';

import { useForm, FormFieldList } from '../composables/useForm';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields: FormFieldList;
}>();
const { fields } = toRefs(props);
const emit = defineEmits<{ submit: [{ vuelidate: Validation; state: Record<string, any> }] }>();

// `useForm` is used for form state management and validation
const { vuelidate, formGroups, formFields, formState, formModels, formReset, buildFieldAttrs } =
  useForm(fields);

const onSubmit = () => {
  emit('submit', { vuelidate: vuelidate.value, state: formState.value });
};

const slotProps = {
  vuelidate,
  fields: formFields,
  groups: formGroups,
  state: formState,
  models: formModels,
  reset: formReset,
};

defineExpose({ ...slotProps });
```

And for completeness, here's the `FormInput` component. It simply re-routes to
other form input components.

```vue
<template>
  <component :is="fieldComp" :name="props.name" v-bind="{ ...props.attrs, ...$attrs }">
    <template #hint> {{ props.hint }} </template>
  </component>
</template>
```

```ts
import type { Component } from 'vue';

import type { FormField, FormFieldTypeMap } from '../composables/useForm';
import FormInputText from './FormInputText.vue';
import FormInputTextarea from './FormInputTextarea.vue';
import FormInputNum from './FormInputNum.vue';
import FormInputSelect from './FormInputSelect.vue';
import FormInputCheckbox from './FormInputCheckbox.vue';

defineOptions({ inheritAttrs: false });
const props = defineProps<Pick<FormField<FormFieldTypeMap>, 'attrs' | 'name' | 'hint' | 'type'>>();

const componentByType = {
  text: FormInputText,
  textarea: FormInputTextarea,
  number: FormInputNum,
  select: FormInputSelect,
  checkbox: FormInputCheckbox,
} satisfies Record<keyof FormFieldTypeMap, Component>;

const fieldComp = computed(() => componentByType[props.type]);
```

And to drill further, individual form field components may look like this. E.g. the `FormInputText` is simply Vuetify's `VTextField`, but with custom handling of hitns and errors.

```vue
<template>
  <div class="FormInputText">
    <v-text-field hide-details :error="!!props.error" v-bind="$attrs" />
    <div class="text-caption">
      <!-- Render the validation error -->
      <div v-if="props.error" class="global-form-error">
        <slot name="error" v-bind="{ error: props.error }">
          {{ props.error }}
        </slot>
      </div>
      <slot name="hint" />
    </div>
  </div>
</template>
```

```ts
defineOptions({ inheritAttrs: false });
const props = defineProps<{ error?: string }>();
```

### Configure supported form field types

Although this library exports composable `useTypedForm` you can see in the examples above that we've used
to import `useForm` composable.

Are they the same thing? Almost. `useForm` is a wrapper for `useTypedForm` that defines the specifics:

- what field types are available (remember the first argument to `createFormField`?)
- mapping from field types to TypeScript types (e.g. that `checkbox` maps to `boolean`)
- what are the default values, and default post-processing steps when the UI form field component
  emits a new value

These are the specs unique to YOUR project. Here's an example configuration:

```ts
import toNumber from 'lodash/toNumber';
import type { VCheckbox, VSelect, VTextField, VTextarea } from 'vuetify/lib/components/index.mjs';
import type { MaybeRef } from 'vue';

import {
  FormField,
  createFormFieldDefaults,
  useTypedForm,
  createScopedFormFieldHelper,
} from '@/../lib/typedForm';
import type { MaybeGroupedArr } from '~~/src/lib/typedForm/utils';

// Re-export commonly-used types for cleaner interface
export type { FormField, FormFieldToType } from '@/../lib/typedForm';

/** The source of truth of the form field types available for use in `useForm` in this project */
export type FormFieldTypeMap = {
  text: { type: string; attrs: VTextField['$props'] & { required?: boolean } };
  textarea: { type: string; attrs: VTextarea['$props'] & { required?: boolean } };
  number: { type: number; attrs: Omit<VTextField['$props'], 'type'> & { required?: boolean } };
  select: { type: any; attrs: VSelect['$props'] & { required?: boolean } };
  checkbox: { type: boolean; attrs: VCheckbox['$props'] & { required?: boolean } };
};

export type FormFieldList<TName extends string = string> = MaybeGroupedArr<
  FormField<FormFieldTypeMap, any, TName>
>;

/**
 * Type helper for constructing a single instance of a form field {@link FormField},
 * scoped to form field types specific this project.
 */
export const createFormField = createScopedFormFieldHelper<FormFieldTypeMap>();

// Definition of defaults for each of the field types we've defined
const formFieldDefaults = createFormFieldDefaults<FormFieldTypeMap>({
  text: {
    default: () => '',
    postProcess: (v: string, f) => (f.required ? v?.trim() : v?.trim() || undefined),
  },
  textarea: {
    default: () => '',
    postProcess: (v: string, f) => (f.required ? v?.trim() : v?.trim() || undefined),
  },
  number: { default: () => 0, postProcess: (v, _f) => toNumber(v.toString(10)) },
  select: { default: () => null, postProcess: (v: any, _f) => v },
  checkbox: { default: () => false, postProcess: (v: boolean, _f) => v },
});

/** Wrapper for {@link useTypedForm} that uses form field types specific to this project */
export const useForm = <T extends FormField<FormFieldTypeMap, any, TName>, TName extends string>(
  formFields: MaybeRef<(T | T[])[]>
) => {
  return useTypedForm<FormFieldTypeMap, T, TName>(formFields, formFieldDefaults);
};
```

## Closing thoughts

This library is powerful in that it provides declarative definition of form state while
allowing full type inference. In our project, we use this so that data can be fully-typed
throughout its journey - from user's input, and all the way to the database.

What's more, as you saw above, although we use Vue, `useTypedForm` could be used also with
other libraries like React, or could even be used on the server (NodeJS). The only requirement
is that `useTypedForm` needs to run in [Vue reactivity effect scope](https://vuejs.org/api/reactivity-advanced.html#effectscope).

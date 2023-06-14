<template>
  <div v-if="priceEstMut.error.value" class="global-form-caption global-form-error">
    There was an error during the submission: {{ priceEstMut.error.value.message }}
  </div>

  <FormMultistep
    v-bind="$attrs"
    :fields="formFields"
    :completed="formCompleted"
    :loading="priceEstMut.loading.value"
    class="FormPriceEstimate"
    @submit="onSubmit"
  >
    <template #group[0].prepend>
      <h4 class="py-2">First tell us a bit about the website.</h4>
    </template>
    <template #group[1].prepend>
      <h4 class="py-2">The following info is used for price estimation.</h4>
    </template>
    <template #group[2].prepend>
      <h4 class="py-2">Next, give us a chance to contact you.</h4>
    </template>
    <template #group[3].prepend>
      <h4 class="py-2">Please leave any other comments here.</h4>
    </template>
    <template #field[hasSessionCookies].prepend> Advanced options: </template>

    <template #form-completed="{ reset }">
      <div>
        Thanks for the submission.
        <br />
        <br />
        Your price estimate is <span class="text-h4">${{ priceEstResult }}</span
        >.
        <br />
        <br />
        We've sent a copy of the request to your email address.
      </div>
      <VBtnPrimary class="mt-5 py-4" @click="() => onReset(reset)">
        Submit another price estimate
      </VBtnPrimary>
    </template>
  </FormMultistep>
</template>

<script setup lang="ts">
import {
  required,
  email,
  url,
  minLength,
  integer,
  minValue,
  maxLength,
  helpers,
} from '@vuelidate/validators';
import countries from 'countries-list';

import type { GqlFormContactInfo, GqlPriceEstimateRequestInput } from '@/../__generated__/graphql';
// import { useCreatePriceEstimate } from '@/../datasources/apollo/endpoints/form';
import { FormFieldToType, FormFieldList, createFormField } from '../../base-ui/composables/useForm';

defineOptions({ inheritAttrs: false });

///////////////////
// FORM FIELDS
///////////////////

type PriceEstimateFormFieldKey = keyof GqlPriceEstimateRequestInput | keyof GqlFormContactInfo;

const countryOptions = Object.entries(countries.countries).map(([code, c]) => ({
  value: code,
  title: c.name,
}));

const formFields = [
  [
    createFormField('text', {
      name: 'websiteName',
      attrs: { label: 'Website name', required: true },
      rules: { required, minLength: minLength(5) },
      hint: "Example: 'Car.com ads'",
    }),
    createFormField('text', {
      name: 'websiteUrl',
      attrs: { label: 'Website URL' },
      rules: { url, minLength: minLength(1) },
      hint: 'Example: https://car.com',
      postProcess: (s) => s?.replace(/\s+/, ''),
    }),
    createFormField('textarea', {
      name: 'websiteDesc',
      attrs: { label: 'Website description', required: true },
      rules: { required, minLength: minLength(100), maxLength: maxLength(3000) },
      hint: `Describe what data is available on the website, what kind of data is there, examples.
    Also mention why you're interested in the data, in what format, and other requirements.`,
    }),
  ],
  [
    createFormField('number', {
      name: 'pageTypeCount',
      attrs: { label: 'Number of different kind of pages to scrape' },
      rules: { minValue: minValue(0), integer },
      hint: `E.g. if a car website has a car ad and seller profile pages, that's 2 pages.`,
    }),
    createFormField('number', {
      name: 'filtersCount',
      attrs: { label: 'Total number of filters for all page types' },
      rules: { minValue: minValue(0), integer },
      hint: `E.g. if you can select a car by model and age, and a seller by country and model, that's
    4 filters total.`,
    }),
    createFormField('checkbox', {
      name: 'hasPersonalData',
      attrs: { label: 'Does the website contain personal info?' },
      rules: {},
      hint: `E.g. people's names, addresses, contact info...`,
    }),
    createFormField('checkbox', {
      name: 'hasResultsLimit',
      attrs: { label: 'Is there a limit on the number of results from search?' },
      rules: {},
      hint: `E.g. if vague searches return nice numbers like 10,000, it likely means that there's
    more results, and we can access only first 10,000. In such case CHECK this box.`,
    }),
    createFormField('checkbox', {
      name: 'hasSessionCookies',
      attrs: { label: "Do you need to log in, or establish a 'session', to access the data?" },
      rules: {},
      hint: `Easy way to test is this - If you copy the URL to a browser in incognito mode, do you
    see the webpage? If NOT, CHECK this box.`,
    }),
    createFormField('number', {
      name: 'antiScrapingMeasuresCount',
      attrs: { label: 'Number of anti-scraping measures' },
      rules: { minValue: minValue(0), integer },
      hint: `If you noticed things like CAPTCHA, add them up here. Please describe them further in
    the comments section.`,
    }),
    createFormField('number', {
      name: 'complexitySubjectiveCount',
      attrs: { label: 'Number of other complexities' },
      rules: { minValue: minValue(0), integer },
      hint: `Imagine you first need to get all car models from another website before you can get
    results from Cars.com. That's what we mean by "complexities". If you noticed other
    things like these, add them up here. Please describe them further in the comments
    section.`,
    }),
  ],
  [
    createFormField('text', {
      name: 'firstName',
      attrs: { label: 'First name', required: true },
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
    createFormField('text', {
      name: 'phone',
      attrs: { label: 'Phone' },
      rules: {
        minLength: minLength(6),
        isPhone: helpers.withMessage(
          'Value is not a valid phone number',
          helpers.regex(/^\+[0-9\s]+$/)
        ),
      },
      hint: `International format: +421 123 456 789`,
      postProcess: (s) => s?.replace(/\s+/, ''),
    }),
    createFormField('select', {
      name: 'country',
      attrs: { label: 'Country', density: 'compact', items: countryOptions },
      rules: {},
    }),
    createFormField('text', {
      name: 'organisation',
      attrs: { label: 'Organisation' },
      rules: {},
    }),
  ],
  [
    createFormField('textarea', {
      name: 'comments',
      attrs: { label: 'Comments' },
      rules: { maxLength: maxLength(3000) },
    }),
  ],
] satisfies FormFieldList<PriceEstimateFormFieldKey>;

///////////////////
// FORM STATE
///////////////////

const formCompleted = ref(false);

const onReset = (doReset: () => void) => {
  doReset();
  formCompleted.value = false;
};

///////////////////
// MUTATION
///////////////////

// const priceEstMut = useCreatePriceEstimate();
const priceEstResult = ref();

const onSubmit = (payload: { state: FormFieldToType<typeof formFields> }) => {
  // if (priceEstMut.loading.value) return;

  const estimateInput = {
    antiScrapingMeasuresCount: payload.state.antiScrapingMeasuresCount,
    comments: payload.state.comments,
    complexitySubjectiveCount: payload.state.complexitySubjectiveCount,
    filtersCount: payload.state.filtersCount,
    hasPersonalData: payload.state.hasPersonalData,
    hasResultsLimit: payload.state.hasResultsLimit,
    hasSessionCookies: payload.state.hasSessionCookies,
    pageTypeCount: payload.state.pageTypeCount,
    websiteDesc: payload.state.websiteDesc!,
    websiteName: payload.state.websiteName!,
    websiteUrl: payload.state.websiteUrl,
  } satisfies GqlPriceEstimateRequestInput;

  const contact = {
    country: payload.state.country,
    email: payload.state.email!,
    firstName: payload.state.firstName!,
    lastName: payload.state.lastName!,
    organisation: payload.state.organisation,
    phone: payload.state.phone,
  } satisfies GqlFormContactInfo;

  // priceEstMut.error.value = null;

  // priceEstMut
  //   .mutate({ estimateInput, contact })
  //   .then((d) => {
  //     priceEstResult.value = d.data ?? 'UNKNOWN';
  //     formCompleted.value = true;
  //   })
  //   .catch((err) => (priceEstMut.error.value = err));
};
</script>

<style lang="scss" scoped>
.FormPriceEstimate {
}
</style>

<template>
  <div
    class="HomePage"
    :class="classes"
  >
    <div class="global-sections">
      <Section title="Form">
        <FormPriceEstimate />
      </Section>

      <Section title="Text Editor">
        <TextEditor disabled model-value="Hello this is text editor" style="zoom: 0.85"> ...Loading... </TextEditor>
      </Section>

      <Section title="How it works">
        <div class="how-it-works text-body-1">
          <template v-for="(step, index) in howItWorksSteps" :key="step">
            <div class="how-it-works-step d-flex flex-column">
              <div>
                {{ step }}
              </div>
              <v-spacer />
              <hr class="ruler" style="background-color: #d2d8b1" />
            </div>
            <div v-if="index + 1 < howItWorksSteps.length" class="arrow">→</div>
          </template>
        </div>
      </Section>

      <Section>
        <div class="stats">
          <template v-for="stat in stats" :key="stat.main">
            <div class="stat">
              <div class="text-h4 font-weight-bold">
                {{ stat.main }}
              </div>
              <div class="text-caption font-weight-bold">
                {{ stat.desc }}
              </div>
            </div>
          </template>
        </div>
      </Section>

      <div class="quote-heading">
        Really cool template.
        <br />
        Wish you had it in your last project.
      </div>

      <Products />
    </div>
  </div>
</template>

<script setup lang="ts">
import { homeRoutes } from '../router';
import FormPriceEstimate from '../components/FormPriceEstimate.vue';

definePageMeta(homeRoutes.home);

const { classes } = useDisplayClasses({ md: 550, lg: 750 });
const router = useRouter();

const howItWorksSteps = [
  'Explore this project template. ',
  'Test yourself - Do a task, e.g. create new Paddle product type, and display it on the page',
  'After you\'re familiar, it\' time to get cracking!',
];

const stats = [
  { main: '4-7 days', desc: 'Avg turnaround time' },
  { main: '$20/mo', desc: 'Starting subscription fee' },
  { main: '24 hrs', desc: 'Response time' },
  { main: '48 hrs', desc: 'Time to get quoted' },
];
</script>

<style lang="scss">
.HomePage {
  .Section {
    gap: 60px;
  }
  .SectionTitle {
    font-size: 2rem !important;
  }

  .global-sections {
    gap: 60px;
  }

  .how-it-works {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 8px;
  }

  .how-it-works-step {
    max-width: 400px;
    padding: 40px 0;
    text-align: center;
  }

  .arrow {
    flex: 1 1 auto;
    padding: 0px 20px;
    font-size: 44px;
    color: #6c6c6c;
    align-self: center;
    transform: rotate(90deg);
  }

  .stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 40px;
    padding: 32px 0px;
    color: #1d2e54;
  }

  .stat {
    flex: 0 0 300px;
    display: flex;
    flex-direction: column;
    padding: 40px 0;
    text-align: center;
    background-color: #f4f4f4;
  }

  .row-gap {
    row-gap: 40px;
  }

  .quote-heading {
    font-weight: bold;
    font-size: 6vw;
    font-style: italic;
    text-align: center;
    color: #1d2e54;
  }

  .ruler {
    margin: 12px 8px;
    height: 4px;
    border: unset;
  }
}

.HomePage.md {
  .SectionTitle {
    font-size: 2.5rem !important;
  }

  .global-sections {
    gap: 120px;
  }

  .stats {
    flex-direction: row;
    background-color: #f4f4f4;
  }
  .stat {
    flex: 0 0 200px;
    padding: 0;
    background-color: unset;
  }
  .row-gap {
    row-gap: 80px;
  }

  .why-us-row {
    > div {
      flex-basis: 300px;
    }
  }
  .quote-heading {
    font-size: 5.5vw;
  }
}
.HomePage.lg {
  .how-it-works {
    flex-direction: row;
  }
  .how-it-works-step {
    padding: 0;
    max-width: 250px;
  }
  .arrow {
    transform: rotate(0deg);
  }
  .quote-heading {
    font-size: 40px;
  }
}
</style>

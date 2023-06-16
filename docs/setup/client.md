# Client

## Stack

### Framework

We use [Nuxt 3](https://nuxt.com/docs/getting-started/introduction) as the web development framework.

Nuxt supports all standard deployment practices: Server-side rendering (SSR), static-site generatio (SSG), and single-page application (SPA).

#### Project structure

See the README in client folder.

### UI library

We use Vuetify 3 as the UI library

> Why Vuetify 3?
>
> I had lots of experience with Vuetify. However, last 2 years they were struggling
> a lot with migration to Vue 3 and release of Vuetify 3. So I was hesitant to use
> them again, and was considering other options:
>
> - [FormKit](https://formkit.com/)
>   - <https://nuxt.com/modules/formkit>
> - [HeadlessUI](https://headlessui.com/)
>   - <https://nuxt.com/modules/headlessui>
> - [Element Plus](https://element-plus.org)
>   - <https://element-plus.org/en-US/component/button.html#basic-usage>
>   - <https://nuxt.com/modules/element-plus>
> - [Quasar](https://quasar.dev/)
>   - <https://quasar.dev/vue-components>
>   - <https://nuxt.com/modules/quasar>
> - [Vuetify](https://vuetifyjs.com/)
>   - <https://nuxt.com/modules/nuxt-vuetify>
>   - <https://github.com/invictus-codes/nuxt-vuetify>
>
> I was mainly looking for a feature-full solution - it doesn't have to be
> the nicest, but should support as many components as possible, easy to work
> with, easy documentation, etc.
>
> With these conditions, Vuetify and Quasar seemed to be praised a lot, followed
> by HeadlessUI and NaiveUI.
>
> - <https://vue-community.org/guide/ecosystem/ui-libraries.html>
> - <https://www.reddit.com/r/vuejs/comments/t6qqu9/which_ui_library_for_vue_3/>
> - <https://www.reddit.com/r/vuejs/comments/t4i5v4/recommended_vue3ready_uiframework/>
> - <https://www.reddit.com/r/vuejs/comments/gnrv0y/quasar_framework_seriously_whats_the_catch/>
> - <https://www.reddit.com/r/vuejs/comments/tktvkt/question_nuxt_or_quasar_for_new_projects_2022/>
>
> I was intrigued in trying out Quasar, but 2 things happened:
>
> - Quasar is also a frontend building framework similar to Nuxt, and using just it's
>   components library in another framework (Nuxt) is non-standard.
>   - <https://stackoverflow.com/questions/67604476>
> - I read through Vuetify [releases and updated docs](https://vuetifyjs.com/en/getting-started/release-notes/),
>   and really liked the changes introduced in Vuetify 3. Especially the option
>   to set ["virtual components" and "default props"](https://vuetifyjs.com/en/features/aliasing/).
>
> Hence, in the end I went with Vuetify.

### Setup

It was enough to use [@invictus.codes/nuxt-vuetify](https://github.com/invictus-codes/nuxt-vuetify/tree/v0.2.20)
plugin. It's useful to see [the source files](https://github.com/invictus-codes/nuxt-vuetify/blob/v0.2.20/src/module.ts)
too.

Beside that, see these tutorials for more context of setting up Vuetify 3 with Nuxt 3:

- <https://dev.to/codybontecou/how-to-use-vuetify-with-nuxt-3-9h9>
- <https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html>

### Dev Exp tooling

#### ESLint

- Error with ESLint + Prettier vs "type": "mode"
  - <https://stackoverflow.com/questions/71184604>
- Eslint Vue 3 Parsing error: '>' expected
  - <https://stackoverflow.com/questions/66597732>

### Nuxt best practices

- Do NOT use "[client components](https://nuxt.com/docs/guide/directory-structure/components#client-components)"
  nor "[server components](https://nuxt.com/docs/guide/directory-structure/components#server-components)"
  (e.g. `Comments.client.vue` or `Comments.server.vue`)
  since they can be actually imported into server-side too.

  - Instead, use the [<ClientOnly>](https://nuxt.com/docs/guide/directory-structure/components#clientonly-component)
    component

- NOTE: If we ever need to migrate from default Nuxt project structure,
  we can use [plugin with hooks to define components outside of the folder sturcture](https://nuxt.com/docs/guide/directory-structure/components#library-authors)

## Deployment

### Netlify

We use [Netlify](https://app.netlify.com/teams/jurooravec/overview) to deploy the client site
as static files.

There's many options for deploymenet, Netlify is just one of the that's convenient.

Unfortunately, for some reason, the automatic CI deployment doesn't work, because netlify
CI worker refuses to publish on warnings. Hence, we deploy manually via [Netlify CLI](https://docs.netlify.com/cli/get-started/).

- Learn more
  - <https://stackoverflow.com/questions/62415804>
  - <https://answers.netlify.com/t/deploy-fails-non-zero-exit-code-on-bundler-install/70245/19>
  - <https://answers.netlify.com/t/netlify-not-building-command-failed-with-exit-code-1-npm-run-build/16999>
  - <https://dev.to/engineervinay/how-to-deploy-react-project-with-warnings-on-netlify-1ahe>

#### Deployment commands

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

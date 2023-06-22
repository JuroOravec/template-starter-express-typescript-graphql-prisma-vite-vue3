# TODO

- Auth by passport (nuxt-auth)

- If spam gets out of hand once I go live

  1. Split mail server to own docker image
  2. Create internal HTTP endpoint on the nodejs SMPT server, so I can
     still send emails from the nodejs HTTP server.
  3. On SMPT node server, use [SpamScanner](https://github.com/spamscanner/spamscanner)
     to filter out spam.
  4. On SMPT node server, [install dependencies](https://spamscanner.net/#/?id=ubuntu).

- Optimize CI/CD pipeline

  - https://blog.nimbleways.com/let-s-make-faster-gitlab-ci-cd-pipelines/
  - https://docs.gitlab.com/ee/ci/yaml/yaml_optimization.html

- analytics

  - Make sure all forms are tracked
  - Make sure all page visits are tracked
  - Make sure all buttons are tracked
  - See https://github.com/mixpanel/mixpanel-js/blob/master/doc/readme.io/javascript-full-api-reference.md#mixpaneltrack_forms

- Configure CSS lib

  - Tailwind? https://nuxt.com/modules/tailwindcss
  - or UnoCSS? https://nuxt.com/modules/unocss

- Configure tests

  - see
    - https://nuxt.com/modules/vitest

- Configure state mgmt

  - see
    - https://nuxt.com/modules/pinia
    - https://nuxt.com/modules/pinia-plugin-persistedstate

- Configure i18n

  - See
    - https://v8.i18n.nuxtjs.org/guide/custom-paths
    - https://nuxt.com/modules/i18n
    - https://vue-i18n.intlify.dev/api/general.html#createi18n

- Configure SEO

  - See
    - https://nuxt.com/modules/seo-kit
    - https://github.com/harlan-zw/nuxt-seo-kit
      OR
    - https://nuxt.com/modules/simple-sitemap
    - https://nuxt.com/modules/schema-org
    - https://github.com/harlan-zw/nuxt-unhead
      OTHER (not either or)
    - https://github.com/harlan-zw/nuxt-delay-hydration
      OTHER SEO (not sure if covered by above or not)
    - https://nuxt.com/modules/simple-robots
    - https://nuxt.com/modules/og-image

- At this point, maybe make a project with sidebase,
  and see which one you like more

  - see
    - https://sidebase.io/sidebase/welcome
    - Also see this as alternative
      - https://vite-pwa-org.netlify.app/
      - https://nuxt.com/modules/vite-pwa-nuxt

- Also check out other projects by sidebase

  - https://github.com/sidebase/nuxt-parse
  - https://github.com/sidebase/nuxt-auth
  - https://github.com/sidebase/nuxt-session
  - https://github.com/sidebase/nuxt-pdf

- Auth strategy

  - See
    - https://github.com/sidebase/nuxt-auth
    - https://github.com/sidebase/nuxt-session
      OR
    - https://nuxt.com/modules/session

- Security

  - See
    - https://nuxt.com/modules/security
    - https://nuxt.com/modules/csurf (IS IT INCLUDED IN nuxt-security?)

- Configure Robots.txt

  - see
    - https://nuxt.com/modules/robots

- Desktop vs mobile view

  - see
    - https://nuxt.com/modules/device
    - https://nuxt.com/modules/nuxt-viewport

- Optimize images

  - see
    - https://v1.image.nuxtjs.org/get-started
    - https://nuxt.com/modules/unlazy

- Add color mode

  - see
    - https://color-mode.nuxtjs.org/

- Drop unused CSS

  - see
    - https://github.com/FullHuman/purgecss
    - https://nuxt.com/modules/purgecss

- Check that DevTools is integrated properly

  - see
    - https://nuxt.com/modules/devtools

- Check if html-validator works
  - see
    - https://html-validator.nuxtjs.org/
    - https://html-validate.org/rules/index.html
- Check if typed router works

  - see
    - https://nuxt.com/modules/typed-router

- Based on content strategy

  - Parse content directory
    - https://nuxt.com/modules/content
  - Add GraphQL layer
  - https://nuxt.com/modules/apollo
    OR
    - https://nuxt.com/modules/graphql-client
      OR
    - https://nuxt.com/modules/graphql-server
  - If I need to host content on CMS, I could use Strapi
    - See
      - https://strapi.io/pricing-self-hosted
      - https://nuxt.com/modules/strapi

- If content local, define assets locally with content

  - see
    - https://nuxt.com/modules/content-assets

- Icons - Do I want to use these?
  - see
    - https://nuxt.com/modules/icon
    - https://nuxt.com/modules/icons
- SVGs - Do I want to use this?

  - see
    - https://nuxt.com/modules/nuxt-svgo

- https://nuxt.com/modules/link-checker
- fonts

  - see
    - https://nuxt.com/modules/fontaine

- Search

  - Algolia
    - https://www.algolia.com/
  - Meilisearch
    - https://www.meilisearch.com/

- Cookie banner

  - see
    - https://nuxt.com/modules/cookie-control

- Ads

  - see
    - https://nuxt.com/modules/google-adsense

- Lighthouse

  - see
    - https://nuxt.com/modules/unlighthouse

- Captcha

  - see
    - https://developers.cloudflare.com/turnstile/
    - https://nuxt.com/modules/turnstile

- ChatGPT

  - see
    - https://nuxt.com/modules/nuxt-chatgpt

- Calendly

  - see
    - https://nuxt.com/modules/calendly

- RSS

  - see
    - https://nuxt.com/modules/module-feed

- Transitions

  - see
    - https://nuxt.com/modules/vue-transitions
    - https://morevm.github.io/vue-transitions/

- Monitor web vitals (or at least log them to console)

  - see
    - https://nuxt.com/modules/web-vitals
    - https://web.dev/vitals/

- Live chat? (e.g. like Intercom)
  - https://github.com/chatwoot/chatwoot
  - https://geekflare.com/best-open-source-live-chat-software/
  - https://www.helpscout.com/blog/intercom-alternatives/

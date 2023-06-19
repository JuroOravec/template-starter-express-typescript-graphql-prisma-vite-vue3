<template>
  <div class="CookiePolicy">
    <h1 class="text-h4 py-8">Cookie Policy</h1>
    <div class="text-body-1 font-weight-bold">
      Last updated
      <span>{{ format(dateLastUpdate, 'do MMM yyyy') }}</span>
    </div>
    <div>
      This Cookie Policy explains how
      {{ config.legalCompanyName }}
      (<Enum :items="['Company', 'we', 'us', 'our']" divider-last=" and ">
        <template #="{ item }">
          <strong>"{{ item }}"</strong>
        </template>
      </Enum>)
      uses cookies and similar technologies to recognize you when you
      visit our website at
      {{ config.publicUrl }}
      (<strong>"Website"</strong>). It explains what these technologies are and why we use them, as
      well as your rights to control our use of them.
    </div>
    <div>
      In some cases we may use cookies to collect personal information, or that becomes personal
      information if we combine it with other information.
    </div>

    <h3 class="text-h6">What are cookies?</h3>
    <div>
      Cookies are small data files that are placed on your computer or mobile device when you visit
      a website. Cookies are widely used by website owners in order to make their websites work, or
      to work more efficiently, as well as to provide reporting information.
    </div>
    <div>
      Cookies set by the website owner (in this case, {{ config.legalCompanyName }}) are called "first-party
      cookies." Cookies set by parties other than the website owner are called "third-party
      cookies." Third-party cookies enable third-party features or functionality to be provided on
      or through the website (e.g., advertising, interactive content, and analytics). The parties
      that set these third-party cookies can recognize your computer both when it visits the website
      in question and also when it visits certain other websites.
    </div>

    <h3 class="text-h6">Why do we use cookies?</h3>
    <div>
      We use first- and third-party cookies for several reasons. Some cookies are required for
      technical reasons in order for our Website to operate, and we refer to these as "essential" or
      "strictly necessary" cookies. Other cookies also enable us to track and target the interests
      of our users to enhance the experience on our Online Properties. Third parties serve cookies
      through our Website for advertising, analytics, and other purposes. This is described in more
      detail below.
    </div>

    <h3 class="text-h6">How can I control cookies?</h3>
    <div>
      You have the right to decide whether to accept or reject cookies. You can exercise your cookie
      rights by setting your preferences in the
      <Linkable @click="openConsentPrefs">Cookie Consent Manager</Linkable>.
      The Cookie Consent Manager
      allows you to select which categories of cookies you accept or reject. Essential cookies
      cannot be rejected as they are strictly necessary to provide you with services.
    </div>
    <div>
      The Cookie Consent Manager can be found in the notification banner and on our website. If you
      choose to reject cookies, you may still use our website though your access to some
      functionality and areas of our website may be restricted. You may also set or amend your web
      browser controls to accept or refuse cookies.
    </div>
    <div>
      The specific types of first- and third-party cookies served through our Website and the
      purposes they perform are described in the table below (please note that the specific cookies
      served may vary depending on the specific Online Properties you visit):
    </div>

    <h2 class="text-h4">Analytics and customization cookies:</h2>
    <div>
      These cookies collect information that is used either in aggregate form to help us understand
      how our Website is being used or how effective our marketing campaigns are, or to help us
      customize our Website for you.
    </div>
    <div class="d-flex flex-column" style="gap:50px;">
      <div v-for="cookie in analyticsCookies" :key="cookie.name">
        <PolicyCookieDetail :cookie="cookie" />
      </div>
    </div>

    <h2 class="text-h4">Unclassified cookies:</h2>
    <div>
      These are cookies that have not yet been categorized. We are in the process of classifying
      these cookies with the help of their providers.
    </div>
    <div class="d-flex flex-column" style="gap:50px;">
      <div v-for="cookie in unclassifiedCookies" :key="cookie.name">
        <PolicyCookieDetail :cookie="cookie" />
      </div>
    </div>

    <h3 class="text-h6">How can I control cookies on my browser?</h3>
    <div>
      As the means by which you can refuse cookies through your web browser controls vary from
      browser to browser, you should visit your browser's help menu for more information. The
      following is information about how to manage cookies on the most popular browsers:
    </div>
    <List :items="browserUrls">
      <template #="{ item }">
        <Linkable :to="item.url">{{ item.name }}</Linkable>
      </template>
    </List>
    <div>
      In addition, most advertising networks offer you a way to opt out of targeted advertising. If
      you would like to find out more information, please visit:
    </div>
    <List :items="adNetworks">
      <template #="{ item }">
        <Linkable :to="item.url">{{ item.name }}</Linkable>
      </template>
    </List>

    <h3 class="text-h6">What about other tracking technologies, like web beacons?</h3>
    <div>
      Cookies are not the only way to recognize or track visitors to a website. We may use other,
      similar technologies from time to time, like web beacons (sometimes called "tracking pixels"
      or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables
      us to recognize when someone has visited our Website or opened an email including them. This
      allows us, for example, to monitor the traffic patterns of users from one page within a
      website to another, to deliver or communicate with cookies, to understand whether you have
      come to the website from an online advertisement displayed on a third-party website, to
      improve site performance, and to measure the success of email marketing campaigns. In many
      instances, these technologies are reliant on cookies to function properly, and so declining
      cookies will impair their functioning.
    </div>

    <h3 class="text-h6">Do you use Flash cookies or Local Shared Objects?</h3>
    <div>
      Websites may also use so-called "Flash Cookies" (also known as Local Shared Objects or "LSOs")
      to, among other things, collect and store information about your use of our services, fraud
      prevention, and for other site operations.
    </div>
    <div>
      If you do not want Flash Cookies stored on your computer, you can adjust the settings of your
      Flash player to block Flash Cookies storage using the tools contained in the
      <Linkable
        to="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
      >
        Website Storage Settings Panel </Linkable
      >. You can also control Flash Cookies by going to the
      <Linkable
        to="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
      >
        Global Storage Settings Panel
      </Linkable>
      and following the instructions (which may include instructions that explain, for example, how
      to delete existing Flash Cookies (referred to "information" on the Macromedia site), how to
      prevent Flash LSOs from being placed on your computer without your being asked, and (for Flash
      Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of
      the page you are on at the time).
    </div>
    <div>
      Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may
      reduce or impede the functionality of some Flash applications, including, potentially, Flash
      applications used in connection with our services or online content.
    </div>

    <h3 class="text-h6">Do you serve targeted advertising?</h3>
    <div>
      Third parties may serve cookies on your computer or mobile device to serve advertising through
      our Website. These companies may use information about your visits to this and other websites
      in order to provide relevant advertisements about goods and services that you may be
      interested in. They may also employ technology that is used to measure the effectiveness of
      advertisements. They can accomplish this by using cookies or web beacons to collect
      information about your visits to this and other sites in order to provide relevant
      advertisements about goods and services of potential interest to you. The information
      collected through this process does not enable us or them to identify your name, contact
      details, or other details that directly identify you unless you choose to provide these.
    </div>

    <h3 class="text-h6">How often will you update this Cookie Policy?</h3>
    <div>
      We may update this Cookie Policy from time to time in order to reflect, for example, changes
      to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore
      revisit this Cookie Policy regularly to stay informed about our use of cookies and related
      technologies.
    </div>

    <div>The date at the top of this Cookie Policy indicates when it was last updated.</div>

    <h3 class="text-h6">Where can I get further information?</h3>
    <div>
      If you have any questions about our use of cookies or other technologies, please email us at:
      <br/>
      <br/>
      {{ escapeEmail(config.legalEmail) }}
      <br/>
      <br/>
      or by post to:
      <br/>
      <br/>
      <Enum :items="config.legalAddress">
        <template #divider>,<br/></template>
      </Enum>
    </div>

    <!-- <div>
      This cookie policy was created using Termly's
      <Linkable to="https://termly.io/products/cookie-consent-manager/">
        Cookie Consent Manager </Linkable
      >.
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

import type { PolicyCookie } from '../types';
import { config } from '@/../globals/config';
import { openConsentPrefs } from '@/../datasources/termly/endpoints/consent';
import { legalRoutes } from '../router';

definePageMeta(legalRoutes['cookie-policy']);

const dateLastUpdate = new Date('2023-06-16');
const publicUrlHost = new URL(config.publicUrl).host;

const analyticsCookies = [
  {
    name: 'mp_#_mixpanel',
    purpose:
      'This cookie is set by Mixpanel for analyzing traffic, and in particular how users reached the platform. Persistent cookie that expires after 1 year',
    provider: publicUrlHost,
    service: {
      name: 'MixPanel',
      policyUrl: 'https://mixpanel.com/legal/privacy-overview/',
    },
    country: 'United States',
    type: 'html_local_storage',
    expiry: 'persistent',
  },
] satisfies PolicyCookie[];

const unclassifiedCookies = [
  {
    name: '__mpq_fef63039a196d8ca712c1ce4ddd84029_ev',
    purpose: 'Used for tracking user analytics in MixPanel',
    provider: publicUrlHost,
    service: {
      name: 'MixPanel',
      policyUrl: 'https://mixpanel.com/legal/privacy-overview/',
    },
    country: 'United States',
    type: 'html_local_storage',
    expiry: 'persistent',
  },
  {
    name: 'paddlejs_campaign_referrer',
    purpose: 'Set by Paddle.com. Used for payment processing.',
    provider: publicUrlHost,
    service: {
      name: 'Paddle',
      policyUrl: 'https://www.paddle.com/legal/privacy',
    },
    country: 'United States',
    type: 'html_session_storage',
    expiry: 'session',
  },
] satisfies PolicyCookie[];

const browserUrls = [
  {
    name: 'Chrome',
    url: 'https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies',
  },
  {
    name: 'Internet Explorer',
    url: 'https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d',
  },
  {
    name: 'Firefox',
    url: 'https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US',
  },
  { name: 'Safari', url: 'https://support.apple.com/en-ie/guide/safari/sfri11471/mac' },
  {
    name: 'Edge',
    url: 'https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd',
  },
  { name: 'Opera', url: 'https://help.opera.com/en/latest/web-preferences/' },
] satisfies { name: string; url: string }[];

const adNetworks = [
  {
    name: 'Digital Advertising Alliance',
    url: 'http://www.aboutads.info/choices/',
  },
  {
    name: 'Digital Advertising Alliance of Canada',
    url: 'https://youradchoices.ca/',
  },
  {
    name: 'European Interactive Digital Advertising Alliance',
    url: 'http://www.youronlinechoices.com/',
  },
] satisfies { name: string; url: string }[];
</script>

<style lang="scss">
.CookiePolicy {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3, h2 {
    padding-top: 24px;
    font-weight: bold;
  }
}
</style>

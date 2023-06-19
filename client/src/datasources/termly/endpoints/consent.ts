/**
 * NOTE: Path to find this script:
 * 1. https://app.termly.io/dashboard/website/<WEBSITE_UUID>/banner-settings
 * 2. Click "Install" (top-right)
 * 3. Click "Embed" on "Step 3: Embed preference center link"
 *
 * To learn more about what this actually does, run the web app locally (`npm run dev`)
 * and in `Devtools > Source`, and find
 * `termly_web/resource-blocker/src/utils/startProcess/onAllApiRespond.js`
 */
export const openConsentPrefs = () => {
  (globalThis as any).displayPreferenceModal();
};

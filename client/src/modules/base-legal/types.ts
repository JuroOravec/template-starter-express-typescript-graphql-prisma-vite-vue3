/** Cookie as described in cookie policy */
export interface PolicyCookie {
  name: string;
  purpose: string;
  provider: string;
  service: {
    name: string;
    policyUrl: string | null;
  };
  country: string;
  type: 'html_local_storage' | 'html_session_storage';
  expiry: 'persistent' | 'session';
}

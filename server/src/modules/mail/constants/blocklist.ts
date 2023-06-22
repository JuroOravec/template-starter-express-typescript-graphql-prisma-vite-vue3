import isDisposable from 'is-disposable';

import { parseEmail } from '../utils';

const blockedEmails = new Set([
  // Spam we've received
  'unbank@gmail.com',
  'unitedbank.kampala@gmail.com',
  'spameri@tiscali.it',
  'info@uba.com',
  'mrkennedyozuokapersonal@gmail.com',
  'mrgodwinemefielebankdirector@gmail.com',
  'beth17780@gmail.com',
  'info@us.org',
  'xx@yy.net',
  'ofikuluchris@yahoo.com',
  'hself653@gmail.com',
  'imf6642@gmail.com',
]);

const blockedHosts = new Set([
  // Misspelt domains
  // See https://github.com/debitoor/email-blacklist/blob/a0d511edb19817d4c7c5334a62a7eff61aa68eaf/index.js
  'gamil.com',
  'gmai.com',
  'gmail.co',
  'gmail.con',
  'gmail.om',
  'gmailc.om',
  'gmaill.com',
  'gmal.com',
  'gmeil.com',
  'gmial.com',
  'gnail.com',
  'hotamil.com',
  'hotmai.com',
  'hotmail.co',
  'hotmail.con',
  'hotmail.om',
  'hotmail.cm',
  'hotmailc.om',
  'hotmeil.com',
  'hotmial.com',
  'hotmali.com',
  'hotmsil.com',
  'hoymail@com',
  'hormail.com',
  'hptmail.com',
  'htomail.com',
  'mgail.com',
  'yahoo.om',
]);

const blockedTLDs = new Set([
  // Misspelt TLDs
  // See https://github.com/debitoor/email-blacklist/blob/a0d511edb19817d4c7c5334a62a7eff61aa68eaf/index.js
  '.cmo',
  '.ocm',
]);

export const isEmailBlocked = async (email: string) => {
  const { host, tld } = parseEmail(email);

  // Check full email name
  if (blockedEmails.has(email)) return true;
  // Check email domain
  if (blockedHosts.has(host)) return true;
  // Check email TLD
  if (blockedTLDs.has(tld)) return true;

  // Ignore emails from disposable email addresses
  if (await isDisposable(email, { remote: true })) return true;

  return false;
};

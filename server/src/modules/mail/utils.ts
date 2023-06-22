import Joi from 'joi';

const emailValidation = Joi.string().email().required();

export const parseEmail = (email: string) => {
  Joi.assert(email, emailValidation);

  const [user, host] = email.split('@');
  if (!user && !host) throw Error(`Invalid email "${email}"`);

  const tld = host.replace(/^.*?\./, ''); // Remove everything up to (incl) first dot
  return { user, host, tld };
};

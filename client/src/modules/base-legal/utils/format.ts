export const escapeEmail = (email: string) => {
  return email.replace(/@/g, ' [at] ').replace(/\./g, ' [dot] ').replace(/-/g, ' [dash] ');
};

import { useAsync } from '@/utils/useAsync';
import { serverRestClient } from '../serverRestClient';

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  const response = await serverRestClient.post<{ error?: { message: string } }>(
    '/auth/login',
    {
      body: JSON.stringify({ email, password }),
    },
  );

  if (response.error?.message) {
    throw Error(response.error?.message);
  }
};

export const signup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  const response = await serverRestClient.post<{ error?: { message: string } }>(
    '/auth/signup',
    {
      body: JSON.stringify({ email, password }),
    },
  );

  if (response.error?.message) {
    throw Error(response.error?.message);
  }
};

export const logout = async (): Promise<void> => {
  return serverRestClient.post<void>('/auth/logout');
};

export const authTest = async (): Promise<void> => {
  return serverRestClient.post<void>('/auth/test');
};

/////////////////////////////
// COMPOSABLES
/////////////////////////////

export const useLogin = () => useAsync(login, { defaultValue: null });
export const useSignup = () => useAsync(signup, { defaultValue: null });
export const useLogout = () => useAsync(logout, { defaultValue: null });
export const useAuthTest = () => useAsync(authTest, { defaultValue: null });

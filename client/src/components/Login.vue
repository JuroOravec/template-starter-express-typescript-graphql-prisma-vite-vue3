<template>
  <div class="pa-8">
    <v-form :disabled="isAuthLoading">
      <v-text-field v-model="email" label="email" />
      <v-text-field v-model="password" label="password" />

      <v-btn
        :disabled="isAuthLoading"
        class="mb-2"
        @click="onLogin"
      >
        Login
        <v-progress-circular
          v-if="isLoadingLogin"
          indeterminate
          class="ml-2"
          size=20
          color="secondary"
        />
      </v-btn>

      <v-btn
        :disabled="isAuthLoading"
        class="mb-2"
        @click="onSignup"
      >
        Signup
        <v-progress-circular
          v-if="isLoadingSignup"
          indeterminate
          class="ml-2"
          size=20
          color="secondary"
        />
      </v-btn>

      <v-btn
        :disabled="isAuthLoading"
        class="mb-2"
        @click="logout"
      >
        Logout
        <v-progress-circular
          v-if="isLoadingLogout"
          indeterminate
          class="ml-2"
          size=20
          color="secondary"
        />
      </v-btn>

      <v-btn
        :disabled="isAuthLoading"
        class="mb-2"
        @click="authTest"
      >
        Test
      </v-btn>

      <p v-if="logoutError" class="text-red text-body-2">
        Failed to logout: {{ logoutError }}
      </p>
      <p v-if="loginError" class="text-red text-body-2">
        Failed to login: {{ loginError }}
      </p>
      <p v-else-if="signupError" class="text-red text-body-2">
        Failed to signup: {{ signupError }}
      </p>
    </v-form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue';

import { useAuthTest, useLogin, useLogout, useSignup } from '@/datasources/serverRest/endpoints/auth';

const Login = defineComponent({
  name: 'Login',
  setup() {
    const email: Ref<string> = ref('');
    const password: Ref<string> = ref('');

    const {isLoading: isLoadingLogin, error: loginError, call: login} = useLogin();
    const {isLoading: isLoadingSignup, error: signupError, call: signup} = useSignup();
    const {isLoading: isLoadingLogout, error: logoutError, call: logout} = useLogout();
    const { call: authTest} = useAuthTest();

    const isAuthLoading = computed(() => isLoadingLogin.value || isLoadingSignup.value);

    const onLogin = (): void => {
      const formData = {
        email: email.value,
        password: password.value,
      };

      login(formData);
    };

    const onSignup = (): void => {
      const formData = {
        email: email.value,
        password: password.value,
      };

      signup(formData);
    };

    return {
      email,
      password,
      onLogin,
      isLoadingLogin,
      loginError,
      onSignup,
      isLoadingSignup,
      signupError,
      isAuthLoading,
      logout,
      isLoadingLogout,
      logoutError,
      authTest,
    };
  },
});

export default Login;
</script>

<style lang="scss">
.Login {
}
</style>

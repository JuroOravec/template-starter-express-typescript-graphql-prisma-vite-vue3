import gql from 'graphql-tag';
import { ref, watch } from 'vue';

import {
  GqlMeUserSettingsFragment,
  usegetMeUserSettingsQuery,
  useupdateMeUserSettingsMutation,
} from '@/../__generated__/graphql';
import { prepareMutation } from '../utils/mutation';

gql`
  fragment MeUserSettings on UserSettings {
    userId
    testVal
  }

  query getMeUserSettings {
    me {
      user {
        userId
        userSettings {
          ...MeUserSettings
        }
      }
    }
  }

  mutation updateMeUserSettings($userSettings: UserSettingsUpdateInput!) {
    me {
      updateUserSettings(userSettings: $userSettings) {
        ...MeUserSettings
      }
    }
  }
`;

/** CRUD composable for UserSettings */
export const useUserSettings = () => {
  const userSettings = ref<GqlMeUserSettingsFragment | null>(null);

  // CRUD operations
  const updateMutation = prepareMutation(useupdateMeUserSettingsMutation({}), {
    onTransform: (data) => {
      const newSettings = data?.me?.updateUserSettings ?? null;
      userSettings.value = newSettings;
    },
  });
  const getQuery = usegetMeUserSettingsQuery({
    fetchPolicy: 'cache-first',
  });

  watch(
    getQuery.result,
    (newData) => {
      const settings = newData?.me?.user?.userSettings;
      userSettings.value = settings ?? null;
    },
    { immediate: true }
  );

  return {
    userSettings,
    getQuery,
    updateMutation,
  };
};

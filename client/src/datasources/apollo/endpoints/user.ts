import gql from 'graphql-tag';
import { computed } from 'vue';

import type { PartialFields } from '@/../utils/types';
import {
  GqlgetMeUserQuery,
  GqlMeUserFragment,
  usegetMeUserQuery,
} from '@/../__generated__/graphql';

gql`
  fragment MeUser on User {
    userId
    firstName
    lastName
    userRoles
  }

  query getMeUser {
    me {
      user {
        ...MeUser
      }
    }
  }
`;

export const transformUser = (
  user: PartialFields<GqlMeUserFragment, 'userRoles'>
): GqlMeUserFragment => ({
  userId: user.userId,
  firstName: user.firstName,
  lastName: user.lastName,
  userRoles: user.userRoles ?? [],
});

export const transformGetMeUserQuery = (res?: GqlgetMeUserQuery): GqlMeUserFragment | null => {
  const user = res?.me?.user ?? null;
  return user ? transformUser(user) : null;
};

export const useGetUser = () => {
  const query = usegetMeUserQuery({ fetchPolicy: 'cache-first' });

  const user = computed(() => transformGetMeUserQuery(query.result.value));
  const userRoles = computed(() => user.value?.userRoles ?? []);

  return {
    user,
    userRoles,
    query,
  };
};

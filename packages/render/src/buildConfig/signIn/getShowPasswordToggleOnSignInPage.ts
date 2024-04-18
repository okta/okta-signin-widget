import type { Databag } from '@/types';

import { hasFeature } from '@/utils';

export const getShowPasswordToggleOnSignInPage = (databag: Databag) => {
  const { featureFlags, orgLoginPageSettings } = databag;

  let res = false;
  if (hasFeature('SHOW_PASSWORD_TOGGLE_ON_SIGN_IN_PAGE', featureFlags)) {
    res = true;
  }
  if (hasFeature('IDENTITY_ENGINE', featureFlags)) {
    res = !!orgLoginPageSettings.showPasswordVisibilityToggle;
  }

  return res;
};

import type { Databag } from '@/types';

import { hasFeature } from '@/utils';

export const getShowIdentifier = ({ featureFlags, orgLoginPageSettings }: Databag) => {
  let res = false;
  if (hasFeature('IDENTITY_ENGINE', featureFlags)) {
    res = !!orgLoginPageSettings.showIdentifier;
  }
  return res;
};

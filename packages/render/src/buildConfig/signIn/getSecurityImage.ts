import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getSecurityImage = (databag: Databag) => {
  const { orgOptionalUserAccountFields, featureFlags } = databag;
  
  let res = true;

  if (orgOptionalUserAccountFields?.hideSecurityImage) {
    res = false;
  }

  if (hasFeature('IDENTITY_ENGINE', featureFlags)) {
    res = false;
  }

  return res;
};

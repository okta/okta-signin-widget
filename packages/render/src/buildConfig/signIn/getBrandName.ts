import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getBrandName = (databag: Databag) => {
  const { brandName, featureFlags } = databag;
  if (hasFeature('MULTIBRAND', featureFlags) && brandName) {
    return brandName;
  }
  
  return 'Okta';
};

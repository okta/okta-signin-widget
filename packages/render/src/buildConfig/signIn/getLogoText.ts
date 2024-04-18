import type { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getLogoText = ({ featureFlags, orgName, brandName }: Databag) => {
  let res = `${orgName} logo`;
  if (hasFeature('MULTIBRAND', featureFlags) && brandName) {
    res = `${brandName} logo`;
  }
  return res;
};

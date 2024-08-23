import type { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getLogoText = ({ featureFlags, orgctx, brandName }: Databag) => {
  let res = orgctx.org ? `${orgctx.org.name} logo` : '';
  if (hasFeature('MULTIBRAND', featureFlags) && brandName) {
    res = `${brandName} logo`;
  }
  return res;
};

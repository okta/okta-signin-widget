import { Databag } from '@/types';
import { hasFeature } from '@/utils';

export const getBackToSignInLink = ({ featureFlags, backToSignInLink }: Databag) => {
  let res = '';
  if (hasFeature('ENG_EML_FOR_SSR', featureFlags) && backToSignInLink) {
    res = backToSignInLink;
  }
  return res;
};

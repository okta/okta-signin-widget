import type { Databag } from '@/types';

import { hasFeature, isAbsoluteUri } from '@/utils';

export const getRedirectUri = (databag: Databag) => {
  const { fromUri, baseUrl, suppliedRedirectUri, featureFlags } = databag;

  if (hasFeature('ALLOW_ABSOLUTE_FROM_URI', featureFlags) && suppliedRedirectUri) {
    return suppliedRedirectUri;
  }

  return isAbsoluteUri(fromUri) ? fromUri : baseUrl + fromUri;
};

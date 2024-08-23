import type { Databag } from '@/types';

import { hasFeature, isAbsoluteUri } from '@/utils';

export const getRedirectUri = (databag: Databag) => {
  const { fromURI = '', baseUrl = '', suppliedRedirectUri = '', featureFlags } = databag;

  if (hasFeature('ALLOW_ABSOLUTE_FROM_URI', featureFlags) && suppliedRedirectUri) {
    return suppliedRedirectUri;
  }

  return isAbsoluteUri(fromURI) ? fromURI : baseUrl + fromURI;
};

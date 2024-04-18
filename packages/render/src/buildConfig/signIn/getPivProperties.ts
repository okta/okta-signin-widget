import type { Databag } from '@/types';

import { hasFeature } from '@/utils';

type PivProperties = {
  certAuthUrl?: string;
  isCustomDomain?: boolean;
  customDomain?: string;
}

export const getPivProperties = (databag: Databag) => {
  const { featureFlags, certAuthUrl, isCustomDomain, customDomain, showX509button } = databag;
  const res = {} as PivProperties;

  if (!showX509button || !hasFeature('X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET', featureFlags)) {
    return res;
  }

  res.isCustomDomain = !!isCustomDomain;
  if (certAuthUrl) {
    res.certAuthUrl = certAuthUrl;
  }
  if (customDomain) {
    res.customDomain = customDomain;
  }

  return res;
};

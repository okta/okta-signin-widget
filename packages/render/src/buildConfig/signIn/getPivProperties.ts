import type { Databag } from '@/types';
import type { WidgetOptions } from '@okta/okta-signin-widget';

import { hasFeature } from '@/utils';

export const getPivProperties = (databag: Databag): WidgetOptions['piv'] => {
  const { featureFlags, certAuthUrl, isCustomDomain, customDomain } = databag;
  
  if (!hasFeature('X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET', featureFlags)) {
    return undefined;
  }
  
  const res = {} as NonNullable<WidgetOptions['piv']> & { customDomain?: string };
  if (certAuthUrl) {
    res.certAuthUrl = certAuthUrl;
  }
  if (isCustomDomain) {
    res.isCustomDomain = !!isCustomDomain;
  }
  if (customDomain) {
    res.customDomain = customDomain;
  }

  return res;
};

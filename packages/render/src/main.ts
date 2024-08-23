import type { Databag, JSPDatabag } from './types';

import { registerListeners } from './registerListeners';
import { buildConfig } from './buildConfig';
import { hasFeature, isOldWebBrowserControl } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const render = (databag: string, jspPageDatabag: JSPDatabag, runLoginPage: any) => {
  let combinedDatabag: Databag;

  try {
    const parsedDatabag = JSON.parse(databag);
    combinedDatabag = { ...parsedDatabag, ...jspPageDatabag };
  } catch (err) {
    // This error should never happen, otherwise loginpage won't render
    // throw directly to catch issue as early as possible
    console.error('Invalid databag string', err);
    throw new Error('Invalid databag');
  }

  const { featureFlags, isMfaAttestation } = combinedDatabag;

  registerListeners();

  const unsupportedContainer = document.getElementById('okta-sign-in') as HTMLElement;
  const failIfCookiesDisabled = !(hasFeature('ENG_DISABLE_COOKIE_CHECK_DURING_OIDC_MFA_ATTESTATION_FLOW', featureFlags) && isMfaAttestation);

  // Old versions of WebBrowser Controls (specifically, OneDrive) render in IE7 browser
  // mode, with no way to override the documentMode. In this case, inform the user they need
  // to upgrade.
  if (isOldWebBrowserControl()) {
    (window.document.getElementById('unsupported-onedrive') as HTMLElement).removeAttribute('style');
    unsupportedContainer?.removeAttribute('style');
  } else if (failIfCookiesDisabled && !navigator.cookieEnabled) {
    (document.getElementById('unsupported-cookie') as HTMLElement).removeAttribute('style');
    unsupportedContainer?.removeAttribute('style');
  } else {
    unsupportedContainer?.parentNode?.removeChild(unsupportedContainer);
    const config = buildConfig(combinedDatabag);

    runLoginPage(function () {
      const res = window.OktaLogin.initLoginPage(config);
      if (hasFeature('SIW_PLUGIN_A11Y', featureFlags) && res.oktaSignIn && window.OktaPluginA11y) {
        window.OktaPluginA11y.init(res.oktaSignIn);
      }
    });
  }
};

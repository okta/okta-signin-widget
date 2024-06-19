import type { Databag } from './types';

// @ts-expect-error no type export from @okta/loginpage
import { OktaLogin } from '@okta/loginpage';
// @ts-expect-error no type export from @okta/loginpage
import { OktaLogin as OktaLoginLegacy } from '@okta/loginpage-legacy';

import { registerListeners } from './registerListeners';
import { buildConfig } from './buildConfig';
import { hasFeature, isOldWebBrowserControl } from './utils';

export const render = (databag: string) => {
  let parsedDatabag: Databag;

  try {
    parsedDatabag = JSON.parse(databag);
  } catch (err) {
    // This error should never happen, otherwise loginpage won't render
    // throw directly to catch issue as early as possible
    console.error('Invalid databag string', err);
    throw new Error('Invalid databag');
  }

  const { featureFlags, isMfaAttestation, disableNewLoginPage } = parsedDatabag;

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
    const config = buildConfig(parsedDatabag);
    const loginModule = disableNewLoginPage ? OktaLoginLegacy : OktaLogin;
    const res = loginModule.initLoginPage(config);
    if (hasFeature('SIW_PLUGIN_A11Y', featureFlags) && res.oktaSignIn && window.OktaPluginA11y) {
      window.OktaPluginA11y.init(res.oktaSignIn);
    }
  }
};

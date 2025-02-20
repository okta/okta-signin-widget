import type { Databag } from '@/types';

import { hasFeature } from '@/utils';
import { getRedirectUri } from './getRedirectUri';
import { getBackToSignInLink } from './getBackToSignInLink';
import { getLinkParams } from './getLinkParams';
import { getSignInConfig } from './signIn';
import { getAccountChooserDiscoveryUrl } from './getAccountChooserDiscoveryUrl';

export const buildConfig = (databag: Databag) => {
  const {
    featureFlags,
    repost = false,
    fromURI,
    isMobileClientLogin,
    isMobileSSO,
    hasChromeOSFeature,
    showLinkToAppStore,
    enrollingFactor,
    showInactiveTabIfDocumentIsHidden,
    refreshPageWhenPageBecomesActive,
    expiresAt,
    refreshWindowMs,
    orgSyncToAccountChooserEnabled,
    isCookieCheckingKSEnabled,
  } = databag;

  const redirectUri = getRedirectUri(databag);
  const backToSignInLink = getBackToSignInLink(databag);
  const linkParams = getLinkParams(databag);
  const hasMfaAttestationFeature = hasFeature('MFA_ATTESTATION', featureFlags);
  const isPersonalOktaOrg = hasFeature('ENG_OKTA_PERSONAL_ENDUSER_DASHBOARD_UI', featureFlags);
  const accountChooserDiscoveryUrl = getAccountChooserDiscoveryUrl(databag);
  const disableiPadCheck = hasFeature('ENG_DISABLE_IPAD_CHECK', featureFlags);
  const enableiPadLoginReload = hasFeature('ENG_ENABLE_IPAD_LOGIN_RELOAD', featureFlags);
  const avoidPageRefresh = !refreshPageWhenPageBecomesActive;
  const signIn = getSignInConfig(databag);

  const loginPageConfig = {
    fromUri: fromURI,
    repost,
    redirectUri,
    backToSignInLink,
    isMobileClientLogin,
    isMobileSSO,
    disableiPadCheck,
    enableiPadLoginReload,
    linkParams,
    hasChromeOSFeature,
    showLinkToAppStore,
    accountChooserDiscoveryUrl,
    mfaAttestation: hasMfaAttestationFeature,
    isPersonalOktaOrg,
    enrollingFactor,
    stateTokenExpiresAt: expiresAt,
    stateTokenRefreshWindowMs: refreshWindowMs,
    orgSyncToAccountChooserEnabled: !!orgSyncToAccountChooserEnabled,
    inactiveTab: {
      enabled: showInactiveTabIfDocumentIsHidden,
      elementId: 'inactive-tab-main-div',
      avoidPageRefresh
    },
    signIn,
    isCookieCheckingKSEnabled,
  };

  return loginPageConfig;
};

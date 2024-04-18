import type { Databag } from '@/types';

import { hasFeature } from '@/utils';
import { getRedirectUri } from './getRedirectUri';
import { getBackToSignInLink } from './getBackToSignInLink';
import { getLinkParams } from './getLinkParams';
import { getSignInConfig } from './signIn';

export const buildConfig = (databag: Databag) => {
  const {
    featureFlags,
    repost = false,
    fromUri,
    accountChooserDiscoveryUrl,
    isMobileClientLogin,
    isMobileSSO,
    disableiPadCheck,
    enableiPadLoginReload,
    hasChromeOSFeature,
    showLinkToAppStore,
    enrollingFactor,
    showInactiveTabIfDocumentIsHidden,
    avoidPageRefresh,
    expiresAt,
    refreshWindowMs,
    orgSyncToAccountChooserEnabled,
  } = databag;

  const redirectUri = getRedirectUri(databag);
  const backToSignInLink = getBackToSignInLink(databag);
  const linkParams = getLinkParams(databag);
  const hasMfaAttestationFeature = hasFeature('MFA_ATTESTATION', featureFlags);
  const isPersonalOktaOrg = hasFeature('ENG_OKTA_PERSONAL_ENDUSER_DASHBOARD_UI', featureFlags);
  const signIn = getSignInConfig(databag);

  const loginPageConfig = {
    fromUri,
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
  };

  return loginPageConfig;
};

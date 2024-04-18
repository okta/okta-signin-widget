import type { Databag } from '@/types';

import { hasFeature } from '@/utils';
import { getCustomButtons } from './getCustomButtons';
import { getPivProperties } from './getPivProperties';
import { getCustomLinks } from './getCustomLinks';
import { getFactorPageCustomLink } from './getFactorPageCustomLink';
import { getProxyIdxResponse } from './getProxyIdxResponse';
import { getIdpDiscovery } from './getIdpDiscovery';
import { getShowPasswordToggleOnSignInPage } from './getShowPasswordToggleOnSignInPage';
import { getShowIdentifier } from './getShowIdentifier';
import { getConsentFunc } from './getConsentFunc';
import { getRegistration } from './getRegistration';
import { getBrandColors } from './getBrandColors';
import { getI18n } from './getI18n';
import { getLogoText } from './getLogoText';

export const getSignInConfig = (databag: Databag) => {
  const {
    featureFlags,
    baseUrl,
    stateToken,
    fromUri,
    username,
    rememberMe,
    smsRecovery,
    callRecovery,
    emailRecovery,
    orgSupportPhoneNumber,
    hideSignOutForMFA = false,
    hideBackToSignInForReset = false,
    signOutUrl,
    hasPasswordlessPolicy,
    securityImage = true,
    selfServiceUnlock = false,
    redirectByFormSubmit = false,
    autoPush = false,
    orgLogo,
    enableDeviceFingerprinting,
    useFingerprintForSecImage,
    interstitialBeforeLoginRedirect,
    orgLoginPageSettings,
    sdkBaseURL,
    overrideExistingStateToken,
  } = databag;

  const proxyIdxResponse = getProxyIdxResponse(databag);
  const idpDiscovery = getIdpDiscovery(databag);
  const showPasswordToggleOnSignInPage = getShowPasswordToggleOnSignInPage(databag);
  const showIdentifier = getShowIdentifier(databag);
  const hasSkipIdpFactorVerificationButton = hasFeature('SKIP_IDP_FACTOR_VERIFICATION_BUTTON', featureFlags);
  const hasOAuth2ConsentFeature = hasFeature('API_ACCESS_MANAGEMENT_CONSENT', featureFlags);
  const consentFunc = getConsentFunc(databag);
  const rememberMyUsernameOnOIE = hasFeature('IDENTITY_ENGINE', featureFlags);
  const registration = getRegistration(databag);
  const webauthn = !hasFeature('WINDOWS_HELLO_FACTOR', featureFlags);
  const showSessionRevocation = hasFeature('ENG_ENABLE_AUTOMATED_SESSION_REVOCATION', featureFlags);
  const sameDeviceOVEnrollmentEnabled = hasFeature('SAME_DEVICE_OV_ENROLLMENT', featureFlags);
  const customButtons = getCustomButtons(databag);
  const pivProperties = getPivProperties(databag);
  const customLinks = getCustomLinks(databag);
  const factorPageCustomLink = getFactorPageCustomLink(databag);
  const logoText = getLogoText(databag);
  const brandColors = getBrandColors(databag);
  const i18n = getI18n(databag);

  return {
    el: '#signin-container',
    baseUrl: baseUrl,
    brandName: 'Okta',
    logo: orgLogo,
    logoText,
    helpSupportNumber: orgSupportPhoneNumber,
    stateToken: stateToken,
    username: username,
    signOutLink: signOutUrl,
    consent: consentFunc,
    authScheme: 'OAUTH2',
    relayState: fromUri,
    proxyIdxResponse: proxyIdxResponse,
    overrideExistingStateToken: overrideExistingStateToken,
    interstitialBeforeLoginRedirect,
    idpDiscovery,
    features: {
      router: true,
      securityImage: securityImage,
      rememberMe: rememberMe,
      autoPush: autoPush,
      webauthn: webauthn,
      smsRecovery: smsRecovery,
      callRecovery: callRecovery,
      emailRecovery: emailRecovery,
      selfServiceUnlock: selfServiceUnlock,
      multiOptionalFactorEnroll: true,
      deviceFingerprinting: enableDeviceFingerprinting,
      useDeviceFingerprintForSecurityImage: useFingerprintForSecImage,
      trackTypingPattern: false,
      hideSignOutLinkInMFA: hideSignOutForMFA,
      hideBackToSignInForReset: hideBackToSignInForReset,
      rememberMyUsernameOnOIE: rememberMyUsernameOnOIE,
      engFastpassMultipleAccounts: true,
      customExpiredPassword: true,
      idpDiscovery: idpDiscovery,
      passwordlessAuth: hasPasswordlessPolicy,
      consent: hasOAuth2ConsentFeature,
      skipIdpFactorVerificationBtn: hasSkipIdpFactorVerificationButton,
      showPasswordToggleOnSignInPage,
      showIdentifier,
      registration,
      redirectByFormSubmit,
      showPasswordRequirementsAsHtmlList: true,
      showSessionRevocation,
      sameDeviceOVEnrollmentEnabled,
    },

    assets: {
      baseUrl: sdkBaseURL,
    },

    language: window.okta.locale,

    i18n,

    brandColors,

    customButtons: customButtons,

    piv: pivProperties,

    helpLinks: {
      help: orgLoginPageSettings.oktaHelpHref,
      forgotPassword: orgLoginPageSettings.forgottenPasswordHref,
      unlock: orgLoginPageSettings.unlockAccountHref,
      custom: customLinks,
      factorPage: factorPageCustomLink
    },

    cspNonce: window.cspNonce,
  };
};

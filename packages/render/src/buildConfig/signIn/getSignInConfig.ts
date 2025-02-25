import type { Databag } from '@/types';

import { hasAnyFeature, hasFeature } from '@/utils';
import { getCustomButtons } from './getCustomButtons';
import { getPivProperties } from './getPivProperties';
import { getCustomLinks } from './getCustomLinks';
import { getFactorPageCustomLink } from './getFactorPageCustomLink';
import { getProxyIdxResponse } from './getProxyIdxResponse';
import { getIdpDiscovery, getIdpDiscoveryRequestContext } from './getIdpDiscovery';
import { getShowPasswordToggleOnSignInPage } from './getShowPasswordToggleOnSignInPage';
import { getShowIdentifier } from './getShowIdentifier';
import { getConsentFunc } from './getConsentFunc';
import { getRegistration } from './getRegistration';
import { getBrandColors } from './getBrandColors';
import { getI18n } from './getI18n';
import { getLogoText } from './getLogoText';
import { getHCaptcha } from './getHCaptcha';
import { getRememberMe } from './getRememberMe';

import type { WidgetOptions } from '@okta/okta-signin-widget';
import { getSecurityImage } from './getSecurityImage';
import { getBrandName } from './getBrandName';

// Adding extra types to WidgetOptions to work with both gen2 & gen3
type Config = WidgetOptions & { 
  authScheme?: string;
  overrideExistingStateToken?: boolean;
  interstitialBeforeLoginRedirect?: string;
  brandColors?: {
    primaryColor?: string;
    primaryColorContrast?: string;
    secondaryColor?: string;
    secondaryColorContrast?: string;
  },
  cspNonce?: string;
};

export const getSignInConfig = (databag: Databag): Config => {
  const {
    featureFlags,
    baseUrl,
    stateToken,
    fromURI,
    username,
    orgSupportPhoneNumber,
    hideSignOutLinkInMFA = false,
    hideBackToSignInForReset = false,
    signOutUrl,
    passwordlessAuth = false,
    orgLogo,
    useDeviceFingerprintForSecurityImage = true,
    interstitialBeforeLoginRedirect,
    orgLoginPageSettings,
    sdkBaseURL,
    overrideExistingStateToken,
    orgctx,
    smsSelfServiceEnabled = false,
    callSelfServiceEnabled = false,
    emailSelfServiceEnabled = false,
    selfServiceUnlockEnabled = false,
    redirectByFormSubmit = false,
    disableSiwPollDelay = false,
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
  const hcaptcha = getHCaptcha(databag);
  const rememberMe = getRememberMe(databag);
  const smsRecovery = !orgctx.org || smsSelfServiceEnabled;
  const callRecovery = !orgctx.org || callSelfServiceEnabled;
  const emailRecovery = !orgctx.org || emailSelfServiceEnabled;
  const securityImage = getSecurityImage(databag);
  const autoPush = hasFeature('OKTA_VERIFY_AUTO_PUSH', featureFlags);
  const brandName = getBrandName(databag);
  const idpDiscoveryRequestContext = getIdpDiscoveryRequestContext(databag);
  const enableDeviceFingerprinting = hasAnyFeature(['SEND_EMAIL_FOR_SIGNON_FROM_NEW_DEVICE', 'VALIDATED_SESSION_EVENT_FIRING'], featureFlags);

  const config: Config = {
    el: '#signin-container',
    baseUrl: baseUrl,
    brandName,
    logo: orgLogo,
    logoText,
    helpSupportNumber: orgSupportPhoneNumber,
    stateToken: stateToken,
    username: username,
    signOutLink: signOutUrl,
    consent: consentFunc,
    authScheme: 'OAUTH2',
    relayState: fromURI,
    proxyIdxResponse: proxyIdxResponse,
    overrideExistingStateToken: overrideExistingStateToken,
    interstitialBeforeLoginRedirect,
    idpDiscovery: {
      requestContext: idpDiscoveryRequestContext
    },
    features: {
      router: true,
      securityImage: securityImage,
      rememberMe: rememberMe,
      autoPush: autoPush,
      webauthn: webauthn,
      smsRecovery: smsRecovery,
      callRecovery: callRecovery,
      emailRecovery: emailRecovery,
      selfServiceUnlock: selfServiceUnlockEnabled,
      multiOptionalFactorEnroll: true,
      sameDeviceOVEnrollmentEnabled,
      deviceFingerprinting: enableDeviceFingerprinting,
      useDeviceFingerprintForSecurityImage: useDeviceFingerprintForSecurityImage,
      trackTypingPattern: false,
      hideSignOutLinkInMFA: hideSignOutLinkInMFA,
      hideBackToSignInForReset: hideBackToSignInForReset,
      rememberMyUsernameOnOIE: rememberMyUsernameOnOIE,
      engFastpassMultipleAccounts: true,
      customExpiredPassword: true,
      idpDiscovery: idpDiscovery,
      passwordlessAuth: passwordlessAuth,
      consent: hasOAuth2ConsentFeature,
      skipIdpFactorVerificationBtn: hasSkipIdpFactorVerificationButton,
      showPasswordToggleOnSignInPage,
      showIdentifier,
      registration,
      redirectByFormSubmit,
      showPasswordRequirementsAsHtmlList: true,
      showSessionRevocation,
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

    hcaptcha,
  };

  if (disableSiwPollDelay) {
    // @ts-expect-error authParams.issuer is incorrectly marked as required
    config.authParams = {
      pollDelay: 0,
    };
  }

  return config;
};

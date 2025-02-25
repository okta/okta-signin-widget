export type FeatureFlags = string[];

// databag from controller model
type ModelDatabag = {
  featureFlags: FeatureFlags;
  orgLoginPageSettings: {
    customLinkOneText?: string;
    customLinkOneHref?: string;
    customLinkTwoText?: string;
    customLinkTwoHref?: string;
    factorPageCustomLinkText: string;
    factorPageCustomLinkHref: string;
    oktaHelpHref: string;
    forgottenPasswordHref: string;
    unlockAccountHref: string;
    showPasswordVisibilityToggle: boolean;
    showIdentifier: boolean;
    usernameLabel: string;
    usernameInlineLabel: string;
    passwordLabel: string;
    passwordInlineLabel: string;
    signinLabel: string;
    forgottenPasswordLabel: string;
    unlockAccountLabel: string;
    oktaHelpLabel: string;
    footerHelpTitle: string;
    recoveryFlowPlaceholder: string;
    postAuthKeepMeSignedInPrompt?: {
      title?: string;
      subtitle?: string;
      acceptButtonText?: string;
      rejectButtonText?: string;
    }
  },
  orgOptionalUserAccountFields?: {
    hideSecurityImage: boolean;
  },
  linkParams?: Record<string, string>,
  fromURI?: string;
  backToSignInLink: string;
  vendor?: string;
  thirdPartyEnrollmentUrl?: string;
  deviceEnrollment?: {
    name: string;
    platform: string;
    enrollmentLink: string;
    vendor: string;
    signInUrl: string;
    orgName: string;
    challengeMethod: string;
  },
  usingDeviceFlow: boolean;
  idpDiscovery?: boolean,
  consentCancelUrl?: string;
  registrationEnabledForSignInWidget?: boolean;
  overrideExistingStateToken?: boolean;
  orgSyncToAccountChooserEnabled?: boolean;
  isMfaAttestation?: boolean;
  interstitialBeforeLoginRedirect?: string;
  repost?: boolean;
  accountChooserDiscoveryUrl: string;
  isMobileClientLogin: boolean;
  enrollingFactor: boolean;
  sdkBaseURL: string;
  expiresAt: number;
  refreshWindowMs: number;
  baseUrl: string;
  stateToken: string;
  username: string;
  suppliedRedirectUri: string;
  showX509button: boolean;
  pivCardButton: string;
  idpBasedPivCardButton: string;
  certAuthUrl: string;
  isCustomDomain: boolean;
  customDomain: string;
  orgSupportPhoneNumber: string;
  hideSignOutLinkInMFA: boolean;
  hideBackToSignInForReset: boolean;
  signOutUrl: string;
  passwordlessAuth: boolean;
  orgLogo: string;
  brandName?: string;
  brandPrimaryColor?: string;
  brandPrimaryColorContrast?: string;
  brandSecondaryColor?: string;
  brandSecondaryColorContrast?: string;
  useSiwGen3: boolean;
  i18nTest: Record<string, string>;
  countryIso?: string;
  isSamlForceAuthnPrompt: boolean;
  smsSelfServiceEnabled: boolean;
  callSelfServiceEnabled: boolean;
  emailSelfServiceEnabled: boolean;
  selfServiceUnlockEnabled: boolean;
  useDeviceFingerprintForSecurityImage: boolean;
  refreshPageWhenPageBecomesActive: boolean;
  redirectByFormSubmit: boolean;
  customSignOutUrl: string;
  orgctx: {
    org?: {
      rememberMeEnabled: boolean;
      name: string;
    }
  };
  appProperties: {
    accountChooserDiscoveryUrl: string;
  };
  i18n: {
    idpBasedPivCardButton: string;
    invalidTokenErrorMsg: string;
    pivCardButton: string;
    countryTranslationJabil: {
      CN: string;
      HK: string;
      MO: string;
      TW: string;
    };
  }
};

// JSP page variables
export type JSPDatabag = {
  isMobileSSO: boolean;
  hasChromeOSFeature: boolean;
  showLinkToAppStore: boolean;
  showInactiveTabIfDocumentIsHidden: boolean;
  isCookieCheckingKSEnabled: boolean;
  disableSiwPollDelay?: boolean;
}

export type Databag = ModelDatabag & JSPDatabag;
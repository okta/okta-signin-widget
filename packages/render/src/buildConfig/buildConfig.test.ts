import { databag } from '@okta/loginpage-mock';
import { buildConfig } from './buildConfig';

describe('buildConfig', () => {
  beforeAll(() => {
    window.okta = {
      locale: 'en'
    };
  });

  it('matches snapshot', () => {
    expect(buildConfig(databag)).toMatchInlineSnapshot(`
{
  "accountChooserDiscoveryUrl": "mock-accountChooserDiscoveryUrl",
  "backToSignInLink": "",
  "disableiPadCheck": false,
  "enableiPadLoginReload": false,
  "enrollingFactor": false,
  "fromUri": "mock-fromURI",
  "hasChromeOSFeature": false,
  "inactiveTab": {
    "avoidPageRefresh": true,
    "elementId": "inactive-tab-main-div",
    "enabled": false,
  },
  "isCookieCheckingKSEnabled": false,
  "isMobileClientLogin": false,
  "isMobileSSO": false,
  "isPersonalOktaOrg": false,
  "linkParams": undefined,
  "mfaAttestation": false,
  "orgSyncToAccountChooserEnabled": false,
  "redirectUri": "http://localhost:3030mock-fromURI",
  "repost": false,
  "showLinkToAppStore": false,
  "signIn": {
    "assets": {
      "baseUrl": "mock-sdkBaseURL",
    },
    "authScheme": "OAUTH2",
    "baseUrl": "http://localhost:3030",
    "brandColors": undefined,
    "brandName": "Okta",
    "consent": undefined,
    "cspNonce": undefined,
    "customButtons": [],
    "el": "#signin-container",
    "features": {
      "autoPush": false,
      "callRecovery": false,
      "consent": false,
      "customExpiredPassword": true,
      "deviceFingerprinting": false,
      "emailRecovery": false,
      "engFastpassMultipleAccounts": true,
      "hideBackToSignInForReset": false,
      "hideSignOutLinkInMFA": false,
      "idpDiscovery": false,
      "multiOptionalFactorEnroll": true,
      "passwordlessAuth": false,
      "redirectByFormSubmit": false,
      "registration": false,
      "rememberMe": false,
      "rememberMyUsernameOnOIE": false,
      "router": true,
      "sameDeviceOVEnrollmentEnabled": false,
      "securityImage": true,
      "selfServiceUnlock": false,
      "showIdentifier": false,
      "showPasswordRequirementsAsHtmlList": true,
      "showPasswordToggleOnSignInPage": false,
      "showSessionRevocation": false,
      "skipIdpFactorVerificationBtn": false,
      "smsRecovery": false,
      "trackTypingPattern": false,
      "useDeviceFingerprintForSecurityImage": false,
      "webauthn": true,
    },
    "hcaptcha": undefined,
    "helpLinks": {
      "custom": [
        {
          "href": "mock-customLinkOneHref",
          "text": "mock-customLinkOneText",
        },
        {
          "href": "mock-customLinkTwoHref",
          "text": "mock-customLinkTwoText",
        },
      ],
      "factorPage": {
        "href": "mock-factorPageCustomLinkHref",
        "text": "mock-factorPageCustomLinkText",
      },
      "forgotPassword": "mock-forgottenPasswordHref",
      "help": "mock-oktaHelpHref",
      "unlock": "mock-unlockAccountHref",
    },
    "helpSupportNumber": "mock-orgSupportPhoneNumber",
    "i18n": {
      "en": {
        "account.unlock.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
        "account.unlock.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
        "forgotpassword": "mock-forgottenPasswordLabel",
        "help": "mock-oktaHelpLabel",
        "mfa.challenge.password.placeholder": "mock-passwordLabel",
        "needhelp": "mock-footerHelpTitle",
        "password.forgot.email.or.username.placeholder": "mock-recoveryFlowPlaceholder",
        "password.forgot.email.or.username.tooltip": "mock-recoveryFlowPlaceholder",
        "primaryauth.password.placeholder": "mock-passwordLabel",
        "primaryauth.password.tooltip": "mock-passwordInlineLabel",
        "primaryauth.title": "mock-signinLabel",
        "primaryauth.username.placeholder": "mock-usernameLabel",
        "primaryauth.username.tooltip": "mock-usernameInlineLabel",
        "unlockaccount": "mock-unlockAccountLabel",
      },
    },
    "idpDiscovery": {
      "requestContext": undefined,
    },
    "interstitialBeforeLoginRedirect": undefined,
    "language": "en",
    "logo": "mock-orgLogo",
    "logoText": "mock org name logo",
    "overrideExistingStateToken": false,
    "piv": undefined,
    "proxyIdxResponse": undefined,
    "relayState": "mock-fromURI",
    "signOutLink": "mock-signOutUrl",
    "stateToken": "mock-stateToken",
    "username": "mock-username",
  },
  "stateTokenExpiresAt": 3600000,
  "stateTokenRefreshWindowMs": 3600000,
}
`);
  });
});

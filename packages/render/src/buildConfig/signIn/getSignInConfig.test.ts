import { databag } from '@okta/loginpage-mock';
import { getSignInConfig } from './getSignInConfig';

describe('getSignInConfig', () => {
  beforeAll(() => {
    window.okta = {
      locale: 'en'
    };
  });

  it('matches snapshot', () => {
    expect(getSignInConfig(databag)).toMatchInlineSnapshot(`
{
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
    "idpDiscovery": {
      "requestContext": "mock-fromUri",
    },
    "multiOptionalFactorEnroll": true,
    "passwordlessAuth": false,
    "redirectByFormSubmit": false,
    "registration": false,
    "rememberMe": false,
    "rememberMyUsernameOnOIE": false,
    "router": true,
    "sameDeviceOVEnrollmentEnabled": false,
    "securityImage": false,
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
    "requestContext": "mock-fromUri",
  },
  "interstitialBeforeLoginRedirect": undefined,
  "language": "en",
  "logo": "mock-orgLogo",
  "logoText": "mock-orgName logo",
  "overrideExistingStateToken": false,
  "piv": {},
  "proxyIdxResponse": undefined,
  "relayState": "mock-fromUri",
  "signOutLink": "mock-signOutUrl",
  "stateToken": "mock-stateToken",
  "username": "mock-username",
}
`);
  });
});
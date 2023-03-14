import { WidgetOptions } from './src/types';

const PROTOCOL = 'http';
const HOSTNAME = 'localhost';
const PORT = '3000';
const ORIGIN = `${PROTOCOL}://${HOSTNAME}:${PORT}`;

// common configs
const common: Partial<WidgetOptions> = {
  // target element
  el: '#okta-signin-container',

  // base url for building issuer
  baseUrl: ORIGIN,

  // https://github.com/okta/okta-signin-widget#logo
  logo: '/logo_widgico.png',

  // https://github.com/okta/okta-signin-widget#logotext
  logoText: 'widgico',

  // https://github.com/okta/okta-signin-widget#language
  language: 'en',

  // https://github.com/okta/okta-signin-widget#redirecturi
  redirectUri: `${ORIGIN}/login/callback`,

  // https://github.com/okta/okta-signin-widget#feature-flags
  features: {
    // autoFocus: true,
    // autoPush: true,
    // callRecovery: true,
    // consent: true,
    // customExpiredPassword: true,
    // deviceFingerprinting: true,
    // emailRecovery: true,
    // engFastpassMultipleAccounts: true,
    // hideBackToSignInForReset: true,
    // hideSignOutLinkInMFA: true,
    // idpDiscovery: true,
    // mfaOnlyFlow: true,
    multiOptionalFactorEnroll: true,
    // passwordlessAuth: true,
    // redirectByFormSubmit: true,
    // registration: true,
    rememberMe: true,
    // rememberMyUsernameOnOIE: true,
    // restrictRedirectToForeground: true,
    router: true,
    // securityImage: true,
    // selfServiceUnlock: true,
    // showIdentifier: true,
    // showKeepMeSignedIn: true,
    // showPasswordRequirementsAsHtmlList: true,
    // showPasswordToggleOnSignInPage: true,
    // skipIdpFactorVerificationBtn: true,
    // smsRecovery: true,
    // trackTypingPattern: true,
    // useDeviceFingerprintForSecurityImage: true,
    // webauthn: true,
  },
  // https://github.com/okta/okta-signin-widget#assets
  assets: {
    baseUrl: '/',
  },
};

export const configs: Record<string, WidgetOptions> = {
  // NOTE: (online) connects to an online preview org
  preview: {
    ...common,
    // TODO change to match your preview org
    baseUrl: 'https://oie-1234567.oktapreview.com',

    // TODO change to match your application client id
    clientId: 'YOUR_CLIENT_ID',
  },

  // NOTE: (local) connects to mock service worker, see handlers.ts
  msw: common,

  // NOTE: (local) run `yarn start:mock-server` from project root
  playground: {
    ...common,
    issuer: `${ORIGIN}/oauth2/default`,
    features: {
      registration: true,
    },
  },
};

export const config = configs.playground;

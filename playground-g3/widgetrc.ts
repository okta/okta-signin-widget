/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const PROTOCOL = 'http';
const HOSTNAME = 'localhost';
const PORT = '3000';
const ORIGIN = `${PROTOCOL}://${HOSTNAME}:${PORT}`;

// common configs
const common = {
  // base url for building issuer
  baseUrl: ORIGIN,

  // https://github.com/okta/okta-signin-widget#logo
  logo: '/img/widgico.png',

  // https://github.com/okta/okta-signin-widget#logotext
  logoText: 'widgico',

  // https://github.com/okta/okta-signin-widget#language
  // language: 'en',

  // https://github.com/okta/okta-signin-widget#redirecturi
  redirectUri: `${ORIGIN}/login/callback`,

  // https://github.com/okta/okta-signin-widget#feature-flags
  features: {
    /** START: V1 Features that are NOT supported in v3 */
    // autoPush: true,
    // callRecovery: true,
    // customExpiredPassword: true,
    // emailRecovery: true,
    // hideBackToSignInForReset: true,
    // idpDiscovery: true,
    multiOptionalFactorEnroll: true,
    // passwordlessAuth: true,
    // redirectByFormSubmit: true,
    // registration: true,
    // securityImage: true,
    // selfServiceUnlock: true,
    // showPasswordRequirementsAsHtmlList: true,
    // skipIdpFactorVerificationBtn: true,
    // smsRecovery: true,
    // trackTypingPattern: true,
    // useDeviceFingerprintForSecurityImage: true,
    // webauthn: true,
    /** END: V1 Features that are NOT supported in v3 */

    /** START: Features that are NOT yet supported in V3 */
    // consent: true,
    // deviceFingerprinting: true,
    // restrictRedirectToForeground: true,
    // showPasswordToggleOnSignInPage: true,
    /** END: Features that are NOT yet supported in V3 */

    /** START: Supported features in v3 */
    // autoFocus: true,
    // hideSignOutLinkInMFA: true,
    // mfaOnlyFlow: true,
    rememberMe: false,
    // rememberMyUsernameOnOIE: false,
    // showIdentifier: true,
    // showKeepMeSignedIn: true,
    /** END: Supported features in v3 */
  },
  // https://github.com/okta/okta-signin-widget#assets
  assets: {
    baseUrl: ORIGIN,
  },

  authParams: {
    pkce: false, // pkce enabled by default in okta-auth-js@3.0
  },
};

export const configs: Record<string, any> = {
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

  testcafe: {
    baseUrl: 'http://localhost:3000',
    logo: '/img/widgico.png',
    logoText: 'Windico',
    features: {
      router: true,
      rememberMe: true,
      multiOptionalFactorEnroll: true,
    },
    stateToken: 'dummy-state-token-wrc',
    authParams: {
      pkce: true,
      codeChallenge: 'asdfasdf',
    },
  },
};

export const config = configs.testcafe;

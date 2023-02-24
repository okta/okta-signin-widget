import { WidgetOptions } from './src/types';

const PROTOCOL = 'https';
const HOSTNAME = 'localhost';
const PORT = '8080';
const ORIGIN = `${PROTOCOL}://${HOSTNAME}:${PORT}`;

// common configs
const common: Partial<WidgetOptions> = {
  logo: '/img/atko.svg',
  logoText: 'Atko',
  language: 'en',
  el: '#okta-signin-container',
  redirectUri: `${ORIGIN}/login/callback`,
  baseUrl: ORIGIN,
  features: {
    router: true,
    rememberMe: true,
    multiOptionalFactorEnroll: true,
  },
  assets: {
    baseUrl: '/',
  },
};

export const configs: Record<string, WidgetOptions> = {
  // NOTE: (online) connects to online preview org
  preview: {
    ...common,
    // acme-spa
    baseUrl: 'https://oie-3394061.oktapreview.com',
    clientId: '0oa3khw51vBqNcnzu1d7',
    redirectUri: `${ORIGIN}/login/callback`,
  },

  // NOTE: (offline) connects to local okta-core instance
  rain: {
    ...common,
    baseUrl: 'http://atko.okta1.com:1802',
    clientId: '0oa8pr7MLq9OLhUtr0g4',
    redirectUri: `http://localhost:8080/login/callback`,
  },

  // NOTE: (offline) connects to mock service worker, see handlers.ts
  msw: {
    ...common,
    baseUrl: ORIGIN,
    clientId: '0oazzz7GmxFMpp7Yn0g3',
  },

  // NOTE: (offline) connects to dyson mock server running on :3030, see
  // "start:mock-server" script in okta-signin-widget package.json
  playground: {
    ...common,
    baseUrl: `http://${HOSTNAME}:3030`,
    clientId: '0oazzz7GmxFMpp7Yn0g3',
    issuer: `http://${HOSTNAME}:3030/oauth2/default`,
    features: {
      registration: true,
    },
  },
};
export const config = configs.rain;

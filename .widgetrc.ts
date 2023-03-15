import type { WidgetOptions } from "./src/types";

const config: WidgetOptions = {
  baseUrl: 'http://localhost:3000',
  logo: '/img/logo_widgico.png',
  logoText: 'Windico',
  language: 'en',
  features: {
    router: true,
    rememberMe: true,
    multiOptionalFactorEnroll: true
  },
  // Do not bootstrap stateToken if you want to enable v1
  stateToken: 'dummy-state-token-wrc',
  authParams: {
    pkce: false // PKCE is enabled by default in okta-auth-js@3.0
  },
  // Host the assets (i.e. json files) locally
  assets: {
    baseUrl: '/'
  },
  // Hooks block processing and run custom logic before or after a form is rendered
  hooks: {
    'identify': {
      after: [
        // createDummyHook('after-identify', 0)
      ]
    },
    'success-redirect': {
      before: [
        // createDummyHook('before-success-redirect',  1000)
      ]
    }
  }
};

export default config;

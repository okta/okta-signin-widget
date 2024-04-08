// @ts-expect-error no type export from @okta/loginpage
import { OktaLogin } from '@okta/loginpage';
// Keep for later use 
// import { OktaLogin as OktaLoginLegacy } from '@okta/loginpage-legacy';

export const render = () => {
  console.info('Initial test setup...');
  OktaLogin.initLoginPage({ 
    linkPrams: {},
    inactiveTab: {},
    signIn: {
      el: '#signin-container',
      baseUrl: 'http://localhost:3000',
      stateToken: 'dummy-state-token-wrc',
      i18n: {},
      features: {}
    } 
  });
};
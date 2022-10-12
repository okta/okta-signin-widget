import type { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
  }
}

function getOktaSignIn(options: WidgetOptions): OktaSignIn {
  return new window.OktaSignIn(options);
}

export default getOktaSignIn;

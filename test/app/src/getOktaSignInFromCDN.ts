import OktaSignIn from '@okta/okta-signin-widget';
import { Config } from "./types";

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
  }
}

function getOktaSignIn(config: Config): OktaSignIn {
  return new window.OktaSignIn(config);
}

export default getOktaSignIn;

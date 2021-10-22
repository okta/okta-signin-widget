// @ts-ignore
import * as OktaSignIn from '@okta/okta-signin-widget';

const getOktaSignIn = (config: any) => {
  return new OktaSignIn(config);
};

export default getOktaSignIn;

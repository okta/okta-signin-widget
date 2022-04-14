import OktaSignIn from '@okta/okta-signin-widget';
import { Config } from './types';

const getOktaSignIn = (config: Config): OktaSignIn => {
  return new OktaSignIn(config);
};

export default getOktaSignIn;

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as OktaSignIn from '@okta/okta-signin-widget';
import { Config } from './types';

const getOktaSignIn = (config: Config): OktaSignIn => {
  return new OktaSignIn(config);
};

export default getOktaSignIn;

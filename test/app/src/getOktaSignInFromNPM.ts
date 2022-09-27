import { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';
import { Config } from './types';

const getOktaSignIn = (config: Config): OktaSignIn => {
  return new OktaSignIn(config as WidgetOptions);
};

export default getOktaSignIn;

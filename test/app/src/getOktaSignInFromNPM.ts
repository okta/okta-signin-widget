import { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';

const getOktaSignIn = (options: WidgetOptions): OktaSignIn => {
  return new OktaSignIn(options);
};

export default getOktaSignIn;

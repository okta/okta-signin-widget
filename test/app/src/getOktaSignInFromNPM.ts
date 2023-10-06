import { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';
//import '@okta/okta-signin-widget/css/okta-sign-in.min.css';

const getOktaSignIn = (options: WidgetOptions): OktaSignIn => {
  return new OktaSignIn(options);
};

export default getOktaSignIn;

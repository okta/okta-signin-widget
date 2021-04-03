import { _ } from 'okta';
import { BaseHeader, BaseView } from '../internals';
import AuthenticatorFooter from './AuthenticatorFooter';
import HeaderBeacon from './HeaderBeacon';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';

export const BaseAuthenticatorBeacon = HeaderBeacon.extend({
  authenticatorKey() {
    return this.options.appState.get('authenticatorKey');
  },

  getBeaconClassName: function() {
    const authenticatorKey = _.result(this, 'authenticatorKey');
    return getIconClassNameForBeacon(authenticatorKey);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: BaseAuthenticatorBeacon,
  }),
  Footer: AuthenticatorFooter,
});

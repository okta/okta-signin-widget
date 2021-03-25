import { BaseHeader, BaseView } from '../internals';
import AuthenticatorFooter from './AuthenticatorFooter';
import HeaderBeacon from './HeaderBeacon';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';

const HeaderBeaconFactor = HeaderBeacon.extend({
  getBeaconClassName: function() {
    const authenticatorKey = this.options.appState.get('authenticatorKey');
    return getIconClassNameForBeacon(authenticatorKey);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconFactor,
  }),
  Footer: AuthenticatorFooter,
});

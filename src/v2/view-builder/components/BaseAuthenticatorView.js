import BaseView from '../internals/BaseView';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from './HeaderBeacon';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';

const HeaderBeaconFactor = HeaderBeacon.extend({
  getBeaconClassName: function () {
    const authenticatorKey = this.options.appState.get('authenticatorKey');
    return getIconClassNameForBeacon(authenticatorKey);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconFactor,
  })
});

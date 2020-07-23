import BaseView from '../internals/BaseView';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from './HeaderBeacon';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';

const HeaderBeaconFactor = HeaderBeacon.extend({
  getBeaconClassName: function () {
    const authenticatorType = this.options.appState.get('authenticatorType');
    return getIconClassNameForBeacon(authenticatorType);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconFactor,
  })
});

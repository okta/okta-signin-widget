import BaseView from '../internals/BaseView';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from './HeaderBeacon';
import { getFactorData } from '../utils/FactorUtil';

const HeaderBeaconFactor = HeaderBeacon.extend({
  getBeaconClassName: function () {
    const factorType = this.options.appState.get('authenticatorType');
    return getFactorData(factorType).iconClassName;
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconFactor,
  })
});

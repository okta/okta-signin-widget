import BaseView from '../../internals/BaseView';
import BaseHeader from '../../internals/BaseHeader';
import HeaderBeaconFactor from '../../components/HeaderBeaconFactor';

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeaconFactor,
  })
});

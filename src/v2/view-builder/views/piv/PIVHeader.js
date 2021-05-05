import { BaseHeader } from '../../internals';
import HeaderBeacon from '../../components/HeaderBeacon';

export default BaseHeader.extend({
  HeaderBeacon: HeaderBeacon.extend({
    getBeaconClassName: function() {
      return 'smartcard';
    },
  })
});

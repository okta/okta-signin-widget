import { BaseHeader } from '../internals';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';
import { AUTHENTICATOR_KEY } from '../../ion/RemediationConstants';
import HeaderBeacon from './HeaderBeacon';

export default BaseHeader.extend({
  HeaderBeacon: HeaderBeacon.extend({
    getBeaconClassName() {
      return getIconClassNameForBeacon(AUTHENTICATOR_KEY.OV);
    }
  })
});

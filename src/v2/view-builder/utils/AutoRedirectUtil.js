import Util from '../../../util/Util';
import {BaseHeader} from '../internals';
import {BaseAuthenticatorBeacon} from '../components/BaseAuthenticatorView';
import {AUTHENTICATOR_KEY} from '../../ion/RemediationConstants';

function getHeader() {
  if (Util.isAndroidOVEnrollment()) {
    return BaseHeader.extend({
      HeaderBeacon: BaseAuthenticatorBeacon.extend({
        authenticatorKey: AUTHENTICATOR_KEY.OV,
      })
    });
  } else {
    return BaseHeader;
  }
}

export { getHeader };

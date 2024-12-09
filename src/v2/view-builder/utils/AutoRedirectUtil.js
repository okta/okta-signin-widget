import Util from '../../../util/Util';
import {BaseHeader} from '../internals';
import {BaseAuthenticatorBeacon} from '../components/BaseAuthenticatorView';
import {AUTHENTICATOR_KEY} from '../../ion/RemediationConstants';

function getHeader() {
  return BaseHeader.extend({
    HeaderBeacon: null,
  
    initialize() {
      if (Util.isAndroidOVEnrollment(this.options.appState.get('authentication'))) {
        this.HeaderBeacon = BaseAuthenticatorBeacon.extend({
          authenticatorKey: AUTHENTICATOR_KEY.OV,
        });
        this.add(this.HeaderBeacon);
      }
    },
  });
}

export { getHeader };

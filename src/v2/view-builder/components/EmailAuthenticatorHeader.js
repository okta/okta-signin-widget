import { BaseHeader } from '../internals';
import { AUTHENTICATOR_KEY } from '../../ion/RemediationConstants';
import { BaseAuthenticatorBeacon } from './BaseAuthenticatorView';

export default BaseHeader.extend({
  HeaderBeacon: BaseAuthenticatorBeacon.extend({
    authenticatorKey: AUTHENTICATOR_KEY.EMAIL,
  })
});

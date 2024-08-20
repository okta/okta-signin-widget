import { _ } from '@okta/courage';
import { BaseHeader, BaseView } from '../internals';
import AuthenticatorFooter from './AuthenticatorFooter';
import HeaderBeacon from './HeaderBeacon';
import { getIconClassNameForBeacon } from '../utils/AuthenticatorUtil';
import { FORMS as REMEDIATION_FORMS } from 'v2/ion/RemediationConstants';

export const BaseAuthenticatorBeacon = HeaderBeacon.extend({
  authenticatorKey() {
    return this.options.appState.get('authenticatorKey');
  },

  idvName() {
    const redirectIDVerifyRemediation = this.options.appState
      .get('remediations')
      ?.find(remediation => {
        return remediation.name === REMEDIATION_FORMS.REDIRECT_IDVERIFY;
      });
    return redirectIDVerifyRemediation?.idp?.id;
  },

  getBeaconClassName: function() {
    const authenticatorKey = _.result(this, 'authenticatorKey');
    const idvName = _.result(this, 'idvName');
    return getIconClassNameForBeacon(authenticatorKey, idvName);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: BaseAuthenticatorBeacon,
  }),
  Footer: AuthenticatorFooter,
});

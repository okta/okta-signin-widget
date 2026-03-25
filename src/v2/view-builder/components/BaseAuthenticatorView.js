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

  displayName() {
    return this.options.appState.get('currentAuthenticator')?.displayName ||
           this.options.appState.get('currentAuthenticatorEnrollment')?.displayName;
  },

  getBeaconClassName: function() {
    const authenticatorKey = _.result(this, 'authenticatorKey');
    const idvName = _.result(this, 'idvName');
    const displayName = _.result(this, 'displayName');
    return getIconClassNameForBeacon(authenticatorKey, idvName, displayName);
  },
});

export default BaseView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: BaseAuthenticatorBeacon,
  }),
  Footer: AuthenticatorFooter,
});

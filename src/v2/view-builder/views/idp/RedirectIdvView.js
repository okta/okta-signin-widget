import { loc } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView } from './BaseIdpAuthenticator';
import { FORMS } from 'v2/ion/RemediationConstants';

const Body = BaseIdPAuthenticatorBody.extend({
  title() {
    const redirectIDVerifyRemediation = this.options.appState.get('remediations').find((remediation) => {
      return remediation.name === FORMS.REDIRECT_IDVERIFY;
    });
    return loc('oie.idv.idp.title', 'login', [redirectIDVerifyRemediation.idp.name]);
  },

  subtitle() {
    return loc('oie.idv.idp.description', 'login');
  },

  save() {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
});

export default BaseIdpAuthenticatorView.extend({
  Body
});

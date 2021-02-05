import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const ON_PREM_TOKEN_CHANGE_KEY = 'idx.error.on-prem.token.change';

const Body = BaseForm.extend({

  className: 'on-prem-authenticator-enroll',

  modelEvents: {
    'error': '_checkTokenChange'
  },

  title () {
    const vendorName =
      this.options.appState.get('currentAuthenticator').displayName ||
      loc('oie.on_prem.authenticator.default.vendorName', 'login');
    return loc('oie.on_prem.enroll.title', 'login', [vendorName]);
  },

  _checkTokenChange (model, convertedErrors) {
    const errorSummaryKeys = convertedErrors?.responseJSON?.errorSummaryKeys;
    if (errorSummaryKeys && errorSummaryKeys.includes(ON_PREM_TOKEN_CHANGE_KEY)) {
      // this means we are in change pin, so we should clear out answer input
      this.model.set('credentials.passcode', '');
      this.render();
    }
  },

  save () {
    return loc('oform.verify', 'login');
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});

import { loc } from '@okta/courage';
import BaseDuoAuthenticatorForm from './BaseDuoAuthenticatorForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseDuoAuthenticatorForm.extend({
  title() {
    return loc('oie.duo.enroll.title', 'login');
  },

  getContextualData() {
    return this.options.appState.get('currentAuthenticator').contextualData;
  },
});

export default BaseAuthenticatorView.extend({
  Body,
});

import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const Body = BaseForm.extend({
  title () {
    return `Email link sent to (${this.options.appState.get('factorEmail')})`;
  },

  save: loc('mfa.challenge.verify', 'login'),
});

export default BaseView.extend({
  Body,
});

import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const RequiredFactorEmailForm = BaseForm.extend({

  title () {
    return `Email link sent to (${this.options.appState.get('factorEmail')})`;
  },

  save: 'Send Email Link',
});

export default BaseView.extend({
  Body: RequiredFactorEmailForm,
});

import { createButton, loc } from '@okta/courage';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const skipAll = createButton({
  className: 'button-primary button skip-all',
  title: function() {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
  click: function() {
    this.options.appState.trigger('invokeAction', RemediationForms.SKIP);
  }
});

export default skipAll;
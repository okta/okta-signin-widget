import { createButton, loc } from '@okta/courage';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const remindMeLater = createButton({
  className: 'button-primary button skip-all',
  title: function() {
    return loc('oie.setup.remind.me.later', 'login');
  },
  click: function() {
    this.options.appState.trigger('invokeAction', RemediationForms.SKIP);
  }
});

export default remindMeLater;

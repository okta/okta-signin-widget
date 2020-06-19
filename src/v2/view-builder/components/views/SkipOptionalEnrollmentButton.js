
import { createButton, loc } from 'okta';
import RemediationEnum from '../../../ion/RemediationEnum';

const skipAll = createButton({
  className: 'button-primary button skip-all',
  title: function () {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
  click: function () {
    this.options.appState.trigger('invokeAction', RemediationEnum.FORMS.SKIP);
  }
});

export default skipAll;
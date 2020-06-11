
import { createButton, loc } from 'okta';

const skipAll = createButton({
  className: 'button-primary button skip-all',
  title: function () {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
  click: function () {
    this.options.appState.trigger('invokeAction', 'skip');
  }
});

export default skipAll;
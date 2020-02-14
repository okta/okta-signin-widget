import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';
const Body = BaseForm.extend({
  title () {
    return  'You will be redirected';
  },
  noButtonBar: true,
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    const currentViewState = this.options.appState.getCurrentViewState();
    if (currentViewState.name === 'device-apple-sso-extension') {
      document.cookie = `stateHandle=${this.options.appState.get('currentState').stateHandle};path=/`;
    }
    // TODO OKTA-250473
    // Form post for success redirect
    Util.redirectWithFormGet(currentViewState.href);
  },
});

export default BaseView.extend({
  Body
});

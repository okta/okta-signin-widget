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
    // TODO OKTA-250473
    // Form post for success redirect
    const url = this.options.appState.getCurrentViewState().href;
    Util.redirectWithFormGet(url);
  },
});

export default BaseView.extend({
  Body
});

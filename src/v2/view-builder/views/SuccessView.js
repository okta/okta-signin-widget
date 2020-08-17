import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title () {
    return  loc('oie.success.redirect', 'login');
  },
  noButtonBar: true,
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    // TODO OKTA-250473
    // Form post for success redirect
    const url = this.options.currentViewState.href;
    Util.redirectWithFormGet(url);
  },

  render () {
    BaseForm.prototype.render.apply(this, arguments);
    this.add('<div class="okta-waiting-spinner"></div>');
  }
});

export default BaseView.extend({
  Body
});

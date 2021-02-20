import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import { loc } from 'okta';

const UnlockAccountView = BaseForm.extend({
  noButtonBar: true,
  title: () => {
    return loc('unlockaccount', 'login');
  }
});

export default BaseView.extend({
  initialize () {
    BaseView.prototype.initialize.apply(this, arguments);
    this.Body = UnlockAccountView;
  }
});
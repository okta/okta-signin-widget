import { BaseForm, BaseView } from '../../internals';
import { loc } from '@okta/courage';

const UnlockAccountView = BaseForm.extend({
  noButtonBar: true,
  title: () => {
    return loc('unlockaccount', 'login');
  }
});

export default BaseView.extend({
  initialize() {
    BaseView.prototype.initialize.apply(this, arguments);
    this.Body = UnlockAccountView;
  }
});
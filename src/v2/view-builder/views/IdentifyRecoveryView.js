import { loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';

const Body = BaseForm.extend({
  saveId: 'identify-recovery-btn',

  title () {
    return loc('password.reset.title.generic', 'login');
  },

  save () {
    return loc('oform.next', 'login');
  },
});

export default BaseView.extend({
  Body,
  Footer: BaseFooter,
});

import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';

const Body = BaseForm.extend({

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

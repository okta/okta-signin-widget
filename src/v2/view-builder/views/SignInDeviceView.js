import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import IdentifierFooter from '../components/IdentifierFooter';
import SignInWithDeviceOption from './signin/SignInWithDeviceOption';

const Body = BaseForm.extend({

  title () {
    return loc('primaryauth.title', 'login');
  },

  noButtonBar: true,

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add(
      SignInWithDeviceOption,
      { selector: '.o-form-fieldset-container',
        bubble: false,
        prepend: true,
        options: { isRequired: true }
      }
    );
  },
});

export default BaseView.extend({
  Body,
  Footer: IdentifierFooter,
});

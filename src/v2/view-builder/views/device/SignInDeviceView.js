import { loc } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import IdentifierFooter from '../../components/IdentifierFooter';
import SignInWithDeviceOption from '../signin/SignInWithDeviceOption';

const Body = BaseForm.extend({

  title() {
    return loc('primaryauth.title', 'login');
  },

  noButtonBar: true,

  initialize() {
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

// override the footer to add all the supported links except the sign out link
// no session is granted at this point
const Footer = IdentifierFooter.extend({
  hasBackToSignInLink: false
});

export default BaseView.extend({
  Body,
  Footer: Footer
});

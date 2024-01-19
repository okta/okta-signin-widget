import { loc } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import IdentifierFooter from '../../components/IdentifierFooter';
import SignInWithDeviceOption from '../signin/SignInWithDeviceOption';
import CookieUtil from '../../../../util/CookieUtil';

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

export default BaseView.extend({
  Body,

  constructor: function() {
    BaseView.apply(this, arguments);

    this.Footer = IdentifierFooter.extend({
      // if the browser already has a session, then we should not render the “Back to sign in” link (OKTA-624224)
      hasBackToSignInLink: !CookieUtil.getCookieUserAuthenticated()
    });
  }
});

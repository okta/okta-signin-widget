import { loc } from 'okta';
import {
  default as ChallengeAuthenticatorPhoneView,
  ResendView
} from './ChallengeAuthenticatorPhoneView';
import BaseForm from '../../internals/BaseForm';

const EnrollResendView = ResendView.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-enroll--warning hide',

    handleResendLink () {
      this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
      // Hide warning, but start a timeout again..
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutAfterTimeout();
    },

  },
);

const Body = ChallengeAuthenticatorPhoneView.prototype.Body.extend(
  {
    className: 'phone-authenticator-enroll',

    title () {
      return loc('oie.phone.enroll.title', 'login');
    },

    postRender () {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.add(EnrollResendView, {
        selector: '.o-form-error-container',
        prepend: true,
      });
    },
  },
);

export default ChallengeAuthenticatorPhoneView.extend({ Body });

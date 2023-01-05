import { loc } from '@okta/courage';
import {
  default as ChallengeAuthenticatorPhoneView,
  ResendView
} from './ChallengeAuthenticatorPhoneView';
import { BaseForm } from '../../internals';

const EnrollResendView = ResendView.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-enroll--warning hide',
    resendActionKey: 'currentAuthenticator-resend',
  },
);

const Body = ChallengeAuthenticatorPhoneView.prototype.Body.extend(
  {
    className: 'phone-authenticator-enroll',

    title() {
      return loc('oie.phone.enroll.title', 'login');
    },

    postRender() {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.add(EnrollResendView, {
        selector: '.o-form-info-container',
        prepend: true,
      });
    },
  },
);

export default ChallengeAuthenticatorPhoneView.extend({ Body });

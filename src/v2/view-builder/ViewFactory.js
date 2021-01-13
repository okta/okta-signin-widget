import Logger from 'util/Logger';
import { AUTHENTICATOR_KEY, FORMS as RemediationForms } from '../ion/RemediationConstants';
import BaseView from './internals/BaseView';

// authenticator ignostic views
import IdentifierView from './views/IdentifierView';
import TerminalView from './views/TerminalView';
import SuccessView from './views/SuccessView';

// Device (Okta Verify)
import DeviceChallengePollView from './views/DeviceChallengePollView';
import SSOExtensionView from './views/SSOExtensionView';
import SignInDeviceView from './views/SignInDeviceView';
import DeviceEnrollmentTerminalView from './views/DeviceEnrollmentTerminalView';

// registration
import EnrollProfileView from './views/EnrollProfileView';

// authenticator list
import SelectAuthenticatorEnrollView from './views/SelectAuthenticatorEnrollView';
import SelectAuthenticatorVerifyView from './views/SelectAuthenticatorVerifyView';

// password
import EnrollAuthenticatorPasswordView from './views/password/EnrollAuthenticatorPasswordView';
import ChallengeAuthenticatorPasswordView from './views/password/ChallengeAuthenticatorPasswordView';
import ReEnrollAuthenticatorPasswordView from './views/password/ReEnrollAuthenticatorPasswordView';
import ReEnrollAuthenticatorWarningPasswordView from './views/password/ReEnrollAuthenticatorWarningPasswordView';
import ResetAuthenticatorPasswordView from './views/password/ResetAuthenticatorPasswordView';

// phone
import EnrollAuthenticatorPhoneView from './views/phone/EnrollAuthenticatorPhoneView';
import EnrollAuthenticatorDataPhoneView from './views/phone/EnrollAuthenticatorDataPhoneView';
import ChallengeAuthenticatorPhoneView from './views/phone/ChallengeAuthenticatorPhoneView';
import ChallengeAuthenticatorDataPhoneView from './views/phone/ChallengeAuthenticatorDataPhoneView';

// security question
import EnrollAuthenticatorSecurityQuestion from './views/security-question/EnrollAuthenticatorSecurityQuestionView';
import ChallengeAuthenticatorSecurityQuestion from './views/security-question/ChallengeAuthenticatorSecurityQuestion';

//webauthn
import EnrollWebauthnView from './views/webauthn/EnrollWebauthnView';
import ChallengeWebauthnView from './views/webauthn/ChallengeWebauthnView';

// email
import EnrollAuthenticatorEmailView from './views/email/EnrollAuthenticatorEmailView';
import ChallengeAuthenticatorEmailView from './views/email/ChallengeAuthenticatorEmailView';

// app(okta verify)
import EnrollPollOktaVerifyView from './views/ov/EnrollPollOktaVerifyView';
import SelectEnrollmentChannelOktaVerifyView from './views/ov/SelectEnrollmentChannelOktaVerifyView';
import EnrollementChannelDataOktaVerifyView from './views/ov/EnrollementChannelDataOktaVerifyView';
import ChallengeOktaVerifyView from './views/ov/ChallengeOktaVerifyView';
import ChallengeOktaVerifyTotpView from './views/ov/ChallengeOktaVerifyTotpView';
import ChallengeOktaVerifyResendPushView from './views/ov/ChallengeOktaVerifyResendPushView';
import ChallengeAuthenticatorDataOktaVerifyView from './views/ov/ChallengeAuthenticatorDataOktaVerifyView';
import ChallengeOktaVerifySSOExtensionView from './views/ov/ChallengeOktaVerifySSOExtensionView';

// google authenticator
// eslint-disable-next-line max-len
import EnrollAuthenticatorGoogleAuthenticatorView from './views/google-authenticator/EnrollAuthenticatorGoogleAuthenticatorView';

// safe mode poll view
import PollView from './views/PollView';

const DEFAULT = '_';

const VIEWS_MAPPING = {
  [RemediationForms.IDENTIFY]: {
    [DEFAULT]: IdentifierView,
  },
  [RemediationForms.DEVICE_CHALLENGE_POLL]: {
    [DEFAULT]: DeviceChallengePollView,
  },
  [RemediationForms.LAUNCH_AUTHENTICATOR]: {
    [DEFAULT]: SignInDeviceView,
  } ,
  [RemediationForms.DEVICE_APPLE_SSO_EXTENSION]: {
    [DEFAULT]: SSOExtensionView,
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifySSOExtensionView,
  },
  [RemediationForms.CANCEL_TRANSACTION]: {
    [DEFAULT]: SSOExtensionView,
  },
  [RemediationForms.ENROLL_PROFILE]: {
    [DEFAULT]: EnrollProfileView,
  },
  [RemediationForms.POLL] : {
    [DEFAULT] : PollView
  },
  [RemediationForms.SELECT_AUTHENTICATOR_ENROLL]: {
    [DEFAULT]: SelectAuthenticatorEnrollView,
  },
  [RemediationForms.AUTHENTICATOR_ENROLLMENT_DATA]: {
    [AUTHENTICATOR_KEY.PHONE]: EnrollAuthenticatorDataPhoneView,
  },
  [RemediationForms.ENROLL_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.PASSWORD]: EnrollAuthenticatorPasswordView,
    [AUTHENTICATOR_KEY.WEBAUTHN]: EnrollWebauthnView,
    [AUTHENTICATOR_KEY.PHONE]: EnrollAuthenticatorPhoneView,
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: EnrollAuthenticatorSecurityQuestion,
    [AUTHENTICATOR_KEY.EMAIL]: EnrollAuthenticatorEmailView,
    [AUTHENTICATOR_KEY.GOOGLE_AUTHENTICATOR]: EnrollAuthenticatorGoogleAuthenticatorView,
  },
  [RemediationForms.ENROLL_POLL]: {
    [AUTHENTICATOR_KEY.OV]: EnrollPollOktaVerifyView,
  },
  [RemediationForms.SELECT_ENROLLMENT_CHANNEL]: {
    [AUTHENTICATOR_KEY.OV]: SelectEnrollmentChannelOktaVerifyView,
  },
  [RemediationForms.ENROLLMENT_CHANNEL_DATA]: {
    [AUTHENTICATOR_KEY.OV]: EnrollementChannelDataOktaVerifyView,
  },
  // Expired scenarios for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR]: {
    // Password expired scenario..
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollAuthenticatorPasswordView,
  },
  // Will expire soon warnings for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR_WARNING]: {
    // Password will expire soon scenario..
    [AUTHENTICATOR_KEY.PASSWORD]: ReEnrollAuthenticatorWarningPasswordView,
  },
  // Reset forms for authenticators..
  [RemediationForms.RESET_AUTHENTICATOR]: {
    // Admin driven password reset..
    [AUTHENTICATOR_KEY.PASSWORD]: ResetAuthenticatorPasswordView,
  },
  [RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [DEFAULT]: SelectAuthenticatorVerifyView,
  },
  [RemediationForms.CHALLENGE_AUTHENTICATOR]: {
    [AUTHENTICATOR_KEY.EMAIL]: ChallengeAuthenticatorEmailView,
    [AUTHENTICATOR_KEY.PASSWORD]: ChallengeAuthenticatorPasswordView,
    [AUTHENTICATOR_KEY.WEBAUTHN]: ChallengeWebauthnView,
    [AUTHENTICATOR_KEY.SECURITY_QUESTION]: ChallengeAuthenticatorSecurityQuestion,
    [AUTHENTICATOR_KEY.PHONE]: ChallengeAuthenticatorPhoneView,
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyTotpView,
  },
  [RemediationForms.CHALLENGE_POLL]: {
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyView,
  },
  [RemediationForms.RESEND]: {
    [AUTHENTICATOR_KEY.OV]: ChallengeOktaVerifyResendPushView,
  },
  [RemediationForms.AUTHENTICATOR_VERIFICATION_DATA]: {
    [AUTHENTICATOR_KEY.PHONE]: ChallengeAuthenticatorDataPhoneView,
    [AUTHENTICATOR_KEY.OV]: ChallengeAuthenticatorDataOktaVerifyView
  },
  [RemediationForms.SUCCESS_REDIRECT]: {
    [DEFAULT]: SuccessView,
  },
  // redirect-idp remediation object looks similar to identifier view
  [RemediationForms.REDIRECT_IDP]: {
    [DEFAULT]: IdentifierView,
  },
  [RemediationForms.DEVICE_ENROLLMENT_TERMINAL]: {
    [DEFAULT]: DeviceEnrollmentTerminalView,
  },
  [RemediationForms.TERMINAL]: {
    [DEFAULT]: TerminalView,
  },
};

module.exports = {
  create (formName, authenticatorKey = DEFAULT) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View for ${formName}.`);
      return BaseView;
    }
    const View = config[authenticatorKey] || config[DEFAULT];
    if (!View) {
      Logger.warn(`Cannot find customized View for ${formName} + ${authenticatorKey}.`);
      return BaseView;
    }

    return View;
  }
};

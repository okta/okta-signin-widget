import Logger from 'util/Logger';
import { FORMS as RemediationForms } from '../ion/RemediationConstants';
import BaseView from './internals/BaseView';

// factor ignostic views
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
    app: ChallengeOktaVerifySSOExtensionView,
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
    phone: EnrollAuthenticatorDataPhoneView,
  },
  [RemediationForms.ENROLL_AUTHENTICATOR]: {
    password: EnrollAuthenticatorPasswordView,
    'security_key': EnrollWebauthnView,
    phone: EnrollAuthenticatorPhoneView,
    'security_question': EnrollAuthenticatorSecurityQuestion,
    email: EnrollAuthenticatorEmailView
  },
  [RemediationForms.ENROLL_POLL]: {
    app: EnrollPollOktaVerifyView,
  },
  [RemediationForms.SELECT_ENROLLMENT_CHANNEL]: {
    app: SelectEnrollmentChannelOktaVerifyView,
  },
  [RemediationForms.ENROLLMENT_CHANNEL_DATA]: {
    app: EnrollementChannelDataOktaVerifyView,
  },
  // Expired scenarios for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR]: {
    // Password expired scenario..
    password: ReEnrollAuthenticatorPasswordView,
  },
  // Will expire soon warnings for authenticators..
  [RemediationForms.REENROLL_AUTHENTICATOR_WARNING]: {
    // Password will expire soon scenario..
    password: ReEnrollAuthenticatorWarningPasswordView,
  },
  // Reset forms for authenticators..
  [RemediationForms.RESET_AUTHENTICATOR]: {
    // Admin driven password reset..
    password: ResetAuthenticatorPasswordView,
  },
  [RemediationForms.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [DEFAULT]: SelectAuthenticatorVerifyView,
  },
  [RemediationForms.CHALLENGE_AUTHENTICATOR]: {
    email: ChallengeAuthenticatorEmailView,
    password: ChallengeAuthenticatorPasswordView,
    'security_key': ChallengeWebauthnView,
    'security_question': ChallengeAuthenticatorSecurityQuestion,
    phone: ChallengeAuthenticatorPhoneView,
    app: ChallengeOktaVerifyTotpView,
  },
  [RemediationForms.CHALLENGE_POLL]: {
    app: ChallengeOktaVerifyView,
  },
  [RemediationForms.RESEND]: {
    app: ChallengeOktaVerifyResendPushView,
  },
  [RemediationForms.AUTHENTICATOR_VERIFICATION_DATA]: {
    phone: ChallengeAuthenticatorDataPhoneView,
    app: ChallengeAuthenticatorDataOktaVerifyView
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
  create (formName, authenticatorType = DEFAULT) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View for ${formName}.`);
      return BaseView;
    }
    const View = config[authenticatorType] || config[DEFAULT];
    if (!View) {
      Logger.warn(`Cannot find customized View for ${formName} + ${authenticatorType}.`);
      return BaseView;
    }

    return View;
  }
};

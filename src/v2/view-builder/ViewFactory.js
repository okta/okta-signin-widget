import Logger from 'util/Logger';
import { FORMS as RemediationForms } from '../ion/RemediationConstants';
import BaseView from './internals/BaseView';

// factor ignostic views
import IdentifierView from './views/IdentifierView';
import TerminalView from './views/TerminalView';
import SuccessView from './views/SuccessView';

// Device (Okta Mobile)
import DeviceChallengePollView from './views/DeviceChallengePollView';
import SSOExtensionView from './views/SSOExtensionView';

// registration
import EnrollProfileView from './views/EnrollProfileView';

// authenticator list
import SelectFactorEnrollView from './views/SelectFactorEnrollView';
import SelectFactorAuthenticateView from './views/SelectFactorAuthenticateView';
import SelectAuthenticatorEnrollView from './views/SelectAuthenticatorEnrollView';
import SelectAuthenticatorVerifyView from './views/SelectAuthenticatorVerifyView';

// password
import EnrollFactorPasswordView from './views/password/EnrollFactorPasswordView';
import RequiredFactorPasswordView from './views/password/RequiredFactorPasswordView';
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
import RequiredFactorWebauthnView from './views/webauthn/RequiredFactorWebauthnView';
import EnrollWebauthnView from './views/webauthn/EnrollWebauthnView';
import ChallengeWebauthnView from './views/webauthn/ChallengeWebauthnView';

// email
import EnrollAuthenticatorEmailView from './views/email/EnrollAuthenticatorEmailView';
import RequiredFactorEmailView from './views/email/RequiredFactorEmailView';
import ChallengeAuthenticatorEmailView from './views/email/ChallengeAuthenticatorEmailView';

// app(okta verify)
import EnrollPollOktaVerifyView from './views/ov/EnrollPollOktaVerifyView';
import SelectEnrollmentChannelOktaVerifyView from './views/ov/SelectEnrollmentChannelOktaVerifyView';
import EnrollementChannelDataOktaVerifyView from './views/ov/EnrollementChannelDataOktaVerifyView';
import ChallengeOktaVerifyView from './views/ov/ChallengeOktaVerifyView';
import ChallengeOktaVerifyPushView from './views/ov/ChallengeOktaVerifyPushView';

const DEFAULT = '_';

const VIEWS_MAPPING = {
  [RemediationForms.IDENTIFY]: {
    [DEFAULT]: IdentifierView,
  },
  [RemediationForms.DEVICE_CHALLENGE_POLL]: {
    [DEFAULT]: DeviceChallengePollView,
  },
  [RemediationForms.DEVICE_APPLE_SSO_EXTENSION]: {
    [DEFAULT]: SSOExtensionView,
  },
  [RemediationForms.CANCEL_TRANSACTION]: {
    [DEFAULT]: SSOExtensionView,
  },
  'select-factor-authenticate': {
    [DEFAULT]: SelectFactorAuthenticateView,
  },
  'select-factor-enroll': {
    [DEFAULT]: SelectFactorEnrollView,
  },
  [RemediationForms.ENROLL_PROFILE]: {
    [DEFAULT]: EnrollProfileView,
  },
  'enroll-factor': {
    email: RequiredFactorEmailView, // TODO EnrollFactorEmailView is unimplemented
    password: EnrollFactorPasswordView,
  },
  'challenge-factor': {
    email: RequiredFactorEmailView,
    password: RequiredFactorPasswordView,
    webauthn: RequiredFactorWebauthnView,
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
    webauthn: RequiredFactorWebauthnView,
    'security_key': ChallengeWebauthnView,
    'security_question': ChallengeAuthenticatorSecurityQuestion,
    phone: ChallengeAuthenticatorPhoneView,
    app: ChallengeOktaVerifyView,
  },
  [RemediationForms.CHALLENGE_POLL]: {
    app: ChallengeOktaVerifyPushView,
  },
  [RemediationForms.AUTHENTICATOR_VERIFICATION_DATA]: {
    phone: ChallengeAuthenticatorDataPhoneView,
  },
  [RemediationForms.SUCCESS_REDIRECT]: {
    [DEFAULT]: SuccessView,
  },
  // redirect-idp remediation object looks similar to identifier view
  [RemediationForms.REDIRECT_IDP]: {
    [DEFAULT]: IdentifierView,
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

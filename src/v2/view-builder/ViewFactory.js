import Logger from 'util/Logger';
import { FORMS as RemediationForms } from '../ion/RemediationConstants';
import BaseView from './internals/BaseView';

// factor ignostic views
import IdentifierView from './views/IdentifierView';
import DeviceChallengePollView from './views/DeviceChallengePollView';
import SSOExtensionView from './views/SSOExtensionView';
import SelectFactorEnrollView from './views/SelectFactorEnrollView';
import SelectFactorAuthenticateView from './views/SelectFactorAuthenticateView';
import SelectAuthenticatorEnrollView from './views/SelectAuthenticatorEnrollView';
import SelectAuthenticatorVerifyView from './views/SelectAuthenticatorVerifyView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';
import SuccessView from './views/SuccessView';

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
// import EnrollFactorEmailView from './views/email/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/email/RequiredFactorEmailView';
import ChallengeAuthenticatorEmailView from './views/email/ChallengeAuthenticatorEmailView';
import TerminalReturnEmailView from './views/email/TerminalReturnEmailView';
import TerminalTransferedEmailView from './views/email/TerminalTransferedEmailView';

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
  [RemediationForms.USER_VERIFICATION_CHALLENGE_POLL]: {
    [DEFAULT]: DeviceChallengePollView,
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
    'security_question': EnrollAuthenticatorSecurityQuestion
  },
  // Expired scenarios for authenticators..
  [RemediationForms.RE_ENROLL_AUTHENTICATOR]: {
    // Password expired scenario..
    password: ReEnrollAuthenticatorPasswordView,
  },
  // Will expire soon warnings for authenticators..
  [RemediationForms.RE_ENROLL_AUTHENTICATOR_WARNING]: {
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
  },
  'authenticator-verification-data': {
    phone: ChallengeAuthenticatorDataPhoneView,
  },
  'terminal-transferred': {
    [DEFAULT]: TerminalView,
    'email': TerminalTransferedEmailView,
  },
  'terminal-return': {
    [DEFAULT]: TerminalView,
    'email': TerminalReturnEmailView,
  },
  [RemediationForms.SUCCESS_REDIRECT]: {
    [DEFAULT]: SuccessView,
  },
  // redirect-idp remediation object looks similar to identifier view
  [RemediationForms.REDIRECT_IDP]: {
    [DEFAULT]: IdentifierView,
  },
};

module.exports = {
  create (formName, factorType = DEFAULT) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View (form: ${formName}). Fallback to default configuration.`);
      if (formName.indexOf('terminal') === 0) {
        return TerminalView;
      } else {
        return BaseView;
      }
    }
    const View = config[factorType] || config[DEFAULT];

    if (!View) {
      Logger.warn(`Cannot find customized View (form: ${formName}, factor: ${factorType}). Fallback to BaseView.`);
      return BaseView;
    }

    return View;
  }
};

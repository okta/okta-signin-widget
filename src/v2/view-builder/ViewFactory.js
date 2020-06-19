import Logger from 'util/Logger';
import RemediationEnum from '../ion/RemediationEnum';
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
import ChallengeAuthenticatorPasswordView from './views/password/ChallengeAuthenticatorPasswordView';
import EnrollAuthenticatorPasswordView from './views/password/EnrollAuthenticatorPasswordView';

// phone
import EnrollAuthenticatorPhoneView from './views/phone/EnrollAuthenticatorPhoneView';
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
import TerminalReturnEmailView from './views/email/TerminalReturnEmailView';
import TerminalTransferedEmailView from './views/email/TerminalTransferedEmailView';

const DEFAULT = '_';

const VIEWS_MAPPING = {
  [RemediationEnum.FORMS.IDENTIFY]: {
    [DEFAULT]: IdentifierView,
  },
  [RemediationEnum.FORMS.DEVICE_CHALLENGE_POLL]: {
    [DEFAULT]: DeviceChallengePollView,
  },
  [RemediationEnum.FORMS.DEVICE_APPLE_SSO_EXTENSION]: {
    [DEFAULT]: SSOExtensionView,
  },
  [RemediationEnum.FORMS.CANCEL_TRANSACTION]: {
    [DEFAULT]: SSOExtensionView,
  },
  'select-factor-authenticate': {
    [DEFAULT]: SelectFactorAuthenticateView,
  },
  'select-factor-enroll': {
    [DEFAULT]: SelectFactorEnrollView,
  },
  [RemediationEnum.FORMS.ENROLL_PROFILE]: {
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

  [RemediationEnum.FORMS.SELECT_AUTHENTICATOR_ENROLL]: {
    [DEFAULT]: SelectAuthenticatorEnrollView,
  },
  [RemediationEnum.FORMS.AUTHENTICATOR_ENROLLMENT_DATA]: {
    phone: EnrollAuthenticatorPhoneView,
  },
  [RemediationEnum.FORMS.ENROLL_AUTHENTICATOR]: {
    password: EnrollAuthenticatorPasswordView,
    'security_key': EnrollWebauthnView,
    phone: null,
    'security_question': EnrollAuthenticatorSecurityQuestion
  },

  [RemediationEnum.FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE]: {
    [DEFAULT]: SelectAuthenticatorVerifyView,
  },
  [RemediationEnum.FORMS.CHALLENGE_AUTHENTICATOR]: {
    email: RequiredFactorEmailView,
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
  [RemediationEnum.FORMS.SUCCESS_REDIRECT]: {
    [DEFAULT]: SuccessView,
  },
  // redirect-idp remediation object looks similar to identifier view
  [RemediationEnum.FORMS.REDIRECT_IDP]: {
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

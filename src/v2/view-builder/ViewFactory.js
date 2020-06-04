import Logger from 'util/Logger';
import BaseView from './internals/BaseView';

// factor ignostic views
import IdentifierView from './views/IdentifierView';
import DeviceChallengePollView from './views/DeviceChallengePollView';
import SSOExtensionView from './views/SSOExtensionView';
import SelectFactorEnrollView from './views/SelectFactorEnrollView';
import SelectFactorAuthenticateView from './views/SelectFactorAuthenticateView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';
import SuccessView from './views/SuccessView';

// password
import EnrollFactorPasswordView from './views/password/EnrollFactorPasswordView';
import RequiredFactorPasswordView from './views/password/RequiredFactorPasswordView';

// phone
import EnrollAuthenticatorPhoneView from './views/phone/EnrollAuthenticatorPhoneView';

//webauthn
import RequiredFactorWebauthnView from './views/webauthn/RequiredFactorWebauthnView';

// email
// import EnrollFactorEmailView from './views/email/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/email/RequiredFactorEmailView';
import TerminalReturnEmailView from './views/email/TerminalReturnEmailView';
import TerminalTransferedEmailView from './views/email/TerminalTransferedEmailView';

const DEFAULT = '_';

const VIEWS_MAPPING = {
  'identify': {
    [DEFAULT]: IdentifierView,
  },
  'device-challenge-poll': {
    [DEFAULT]: DeviceChallengePollView,
  },
  'device-apple-sso-extension': {
    [DEFAULT]: SSOExtensionView,
  },
  'cancel-transaction': {
    [DEFAULT]: SSOExtensionView,
  },
  'select-factor-authenticate': {
    [DEFAULT]: SelectFactorAuthenticateView,
  },
  'select-factor-enroll': {
    [DEFAULT]: SelectFactorEnrollView,
  },
  'enroll-profile': {
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
  // TODO: rename file name by replacing `factor` with `authenticator`.
  'select-authenticator-authenticate': {
    [DEFAULT]: SelectFactorAuthenticateView,
  },
  'select-authenticator-enroll': {
    [DEFAULT]: SelectFactorEnrollView,
  },
  'select-authenticator-enroll-data': {
    phone: EnrollAuthenticatorPhoneView,
  },
  'enroll-authenticator': {
    password: EnrollFactorPasswordView,
    webauthn: null,
    phone: null,
    'security_question': null
  },
  'challenge-authenticator': {
    email: RequiredFactorEmailView,
    password: RequiredFactorPasswordView,
    webauthn: RequiredFactorWebauthnView,
    phone: null,
    'security_question': null
  },
  'terminal-transferred': {
    [DEFAULT]: TerminalView,
    'email': TerminalTransferedEmailView,
  },
  'terminal-return': {
    [DEFAULT]: TerminalView,
    'email': TerminalReturnEmailView,
  },
  'success-redirect': {
    [DEFAULT]: SuccessView,
  },
  // redirect remediation object looks similar to identifier view
  'redirect': {
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

import Logger from 'util/Logger';
import BaseView from './internals/BaseView';

// factor ignostic views
import IdentifierView from './views/IdentifierView';
import SelectFactorView from './views/SelectFactorView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';

// password
import EnrollFactorPasswordView from './views/password/EnrollFactorPasswordView';
import RequiredFactorPasswordView from './views/password/RequiredFactorPasswordView';

// email
import EnrollFactorEmailView from './views/email/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/email/RequiredFactorEmailView';
import OTPEmailView from './views/email/OTPEmailView';
import TerminalReturnEmailView from './views/email/TerminalReturnEmailView';
import TerminalTransferedEmailView from './views/email/TerminalTransferedEmailView';


const DEFAULT = '_';

const VIEWS_MAPPING = {
  'identify': {
    [DEFAULT]: IdentifierView,
  },
  'select-factor': {
    [DEFAULT]: SelectFactorView,
  },
  'switch-factor': {
    [DEFAULT]: SelectFactorView,
  },
  'enroll-profile': {
    [DEFAULT]: EnrollProfileView,
  },
  'enroll-factor': {
    email: EnrollFactorEmailView,
    password: EnrollFactorPasswordView
  },
  'challenge-factor': {
    email: RequiredFactorEmailView,
    password: RequiredFactorPasswordView,
  },
  'otp': {
    email: OTPEmailView,
  },
  'terminal-transfered': {
    [DEFAULT]: TerminalView,
    'email': TerminalTransferedEmailView,
  },
  'terminal-return': {
    [DEFAULT]: TerminalView,
    'email': TerminalReturnEmailView,
  },
  'terminal-invalid': {
    [DEFAULT]: TerminalView,
  },
  'terminal-expired': {
    [DEFAULT]: TerminalView,
  },
  'terminal-revoked': {
    [DEFAULT]: TerminalView,
  },
  // Fall back when neither remediation nor terminal-* views found.
  'terminal': {
    [DEFAULT]: TerminalView,
  },
};

module.exports = {
  create (formName, factorType = DEFAULT) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View (form: ${formName}). Fallback to BaseView.`);
      return BaseView;
    }
    const View = config[factorType] || config[DEFAULT];

    if (!View) {
      Logger.warn(`Cannot find customized View (form: ${formName}, factor: ${factorType}). Fallback to BaseView.`);
      return BaseView;
    }

    return View;
  }
};

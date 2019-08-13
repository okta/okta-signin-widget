import Logger from 'util/Logger';
import IdentifierView from './views/IdentifierView';
import SelectFactorView from './views/SelectFactorView';
import EnrollFactorPasswordView from './views/EnrollFactorPasswordView';
import EnrollFactorEmailView from './views/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/RequiredFactorEmailView';
import RequiredFactorPasswordView from './views/RequiredFactorPasswordView';
import OTPEmailView from './views/OTPEmailView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';
import TerminalReturnView from './views/TerminalReturnView';
import TerminalTransferedView from './views/TerminalTransferedView';
import BaseView from './internals/BaseView';

const DEFAULT = '_';

const VIEWS_MAPPING = {
  'identify': {
    [DEFAULT]: IdentifierView,
  },
  'select-factor': {
    [DEFAULT]: SelectFactorView,
  },
  'enroll-profile': {
    [DEFAULT]: EnrollProfileView,
  },
  'enroll-factor': {
    email: EnrollFactorEmailView,
    password: EnrollFactorPasswordView
  },
  'required-factor': {
    email: RequiredFactorEmailView,
    password: RequiredFactorPasswordView,
  },
  'otp': {
    email: OTPEmailView,
  },
  'terminal-transfered': {
    [DEFAULT]: TerminalView,
    'email': TerminalTransferedView,
  },
  'terminal-return': {
    [DEFAULT]: TerminalView,
    'email': TerminalReturnView,
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

import Logger from 'util/Logger';
import BaseView from './internals/BaseView';

// factor ignostic views
import IdentifierView from './views/IdentifierView';
import SelectFactorEnrollView from './views/SelectFactorEnrollView';
import SelectFactorAuthenticateView from './views/SelectFactorAuthenticateView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';
import SuccessView from './views/SuccessView';
// password
import EnrollFactorPasswordView from './views/password/EnrollFactorPasswordView';
import RequiredFactorPasswordView from './views/password/RequiredFactorPasswordView';

// email
import EnrollFactorEmailView from './views/email/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/email/RequiredFactorEmailView';
import TerminalReturnEmailView from './views/email/TerminalReturnEmailView';
import TerminalTransferedEmailView from './views/email/TerminalTransferedEmailView';


const DEFAULT = '_';

const VIEWS_MAPPING = {
  'identify': {
    [DEFAULT]: IdentifierView,
  },
  //select-factor-authenticate is used to show the list of factors before challenge flow
  //select-factor-enroll is used to show the list of factors before enroll flows
  'select-factor': {
    authenticate: SelectFactorAuthenticateView,
    enroll: SelectFactorEnrollView
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
  'terminal-transferred': {
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
  'success-redirect': {
    [DEFAULT]: SuccessView,
  },
  // Fall back when neither remediation nor terminal-* views found.
  'terminal': {
    [DEFAULT]: TerminalView,
  },
};

module.exports = {
  create (formName, factorType = DEFAULT, step) {
    const config = VIEWS_MAPPING[formName];
    if (!config) {
      Logger.warn(`Cannot find customized View (form: ${formName}). Fallback to BaseView.`);
      return BaseView;
    }
    // look for customized view by step, then by factor, if not found then use DEFAULT
    const View = config[step] || config[factorType] || config[DEFAULT];

    if (!View) {
      Logger.warn(`Cannot find customized View (form: ${formName}, factor: ${factorType}). Fallback to BaseView.`);
      return BaseView;
    }

    return View;
  }
};

import Logger from 'util/Logger';
import IdentifierView from './views/IdentifierView';
import SelectFactorView from './views/SelectFactorView';
import EnrollFactorPasswordView from './views/EnrollFactorPasswordView';
import EnrollFactorEmailView from './views/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/RequiredFactorEmailView';
import RequiredFactorPasswordView from './views/RequiredFactorPasswordView';
import FactorPollVerificationEmailView from './views/FactorPollVerificationEmailView';
import OTPEmailView from './views/OTPEmailView';
import EnrollProfileView from './views/EnrollProfileView';
import TerminalView from './views/TerminalView';
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
  'factor-poll-verification': {
    email: FactorPollVerificationEmailView,
  },
  'otp': {
    email: OTPEmailView,
  },
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

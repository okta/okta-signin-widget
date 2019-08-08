import Logger from 'util/Logger';
import IdentifierView from './views/IdentifierView';
import SelectFactorView from './views/SelectFactorView';
import EnrollFactorPasswordView from './views/EnrollFactorPasswordView';
import EnrollFactorEmailView from './views/EnrollFactorEmailView';
import RequiredFactorEmailView from './views/RequiredFactorEmailView';
import RequiredFactorPasswordView from './views/RequiredFactorPasswordView';
import FactorPollVerificationView from './views/FactorPollVerificationView';
import OTPView from './views/OTPView';
import EnrollProfileView from './views/EnrollProfileView';
import BaseView from './internals/BaseView';

const VIEWS_MAPPING = {
  'identify': IdentifierView,
  'select-factor': SelectFactorView,
  'enroll-factor-email': EnrollFactorEmailView,
  'enroll-factor-password': EnrollFactorPasswordView,
  'required-factor-email': RequiredFactorEmailView,
  'required-factor-password': RequiredFactorPasswordView,
  'factor-poll-verification': FactorPollVerificationView,
  'otp': OTPView,
  'enroll-profile': EnrollProfileView,
};

module.exports = {
  create (formName) {
    const View = VIEWS_MAPPING[formName];
    if (!View) {
      Logger.warn(`Cannot find customized View for form (${formName}). Fallback to BaseView.`);
    }
    return View ? View : BaseView;
  }
};

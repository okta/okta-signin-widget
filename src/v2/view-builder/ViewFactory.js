import IdentifierView from './views/IdentifierView';
import SelectFactorView from './views/SelectFactorView';
import EnrollFactorPasswordView from './views/EnrollFactorPasswordView';
import BaseView from './internals/BaseView';

const VIEWS_MAPPING = {
  identify: IdentifierView,
  'select-factor': SelectFactorView,
  'enroll-factor-password': EnrollFactorPasswordView,
};

module.exports = {
  create (formName) {
    const View = VIEWS_MAPPING[formName];
    return View ? View : BaseView;
  }
};

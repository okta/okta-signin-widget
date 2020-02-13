import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Util from '../../../util/Util';

const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form sso-extension-challenge',

  title: loc('signin', 'login'),

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add('<div class="spinner"></div>');
    setTimeout(() => Util.redirectWithFormGet(this.options.currentViewState.href), 500);
  }
});

export default BaseView.extend({
  Body,
});

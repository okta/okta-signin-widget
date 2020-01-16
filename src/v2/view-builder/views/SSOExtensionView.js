import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form sso-extension-challenge',

  title: loc('signin', 'login'),

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.add('<div class="spinner"></div>');
    this.options.appState.trigger('saveForm', this.model);
  }
});

export default BaseView.extend({
  Body,
});

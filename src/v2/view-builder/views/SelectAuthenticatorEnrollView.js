import { BaseForm, BaseView } from '../internals';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function() {
    return loc('oie.select.authenticators.enroll.title', 'login');
  },
  subtitle: function() {
    const subtitle = this.options.settings.get('brandName') ?
      loc('oie.select.authenticators.enroll.subtitle.2.custom', 'login', [this.options.settings.get('brandName')]):
      loc('oie.select.authenticators.enroll.subtitle.2', 'login');
    return subtitle;
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});


import { BaseForm, BaseView } from '../internals';
import { loc } from '@okta/courage';

const Body = BaseForm.extend({
  title: function() {
    return loc('oie.select.authenticators.enroll.title', 'login');
  },
  subtitle: function() {
    const subtitle = this.options.settings.get('brandName') ?
      loc('oie.select.authenticators.enroll.subtitle.custom', 'login', [this.options.settings.get('brandName')]):
      loc('oie.select.authenticators.enroll.subtitle', 'login');
    return subtitle;
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});


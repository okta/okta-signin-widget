import { loc } from 'okta';
import { BaseForm, BaseFooter, BaseView } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';

const Body = BaseForm.extend({
  title () {
    return loc('registration.form.title', 'login');
  },

  save () {
    return loc('registration.form.submit', 'login');
  }
});

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    if (this.options.appState.hasRemediationObject(RemediationForms.SELECT_IDENTIFY)) {
      links.push({
        'type': 'link',
        'label': loc('haveaccount', 'login'),
        'name': 'back',
        'actionPath': RemediationForms.SELECT_IDENTIFY,
      });
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer
});

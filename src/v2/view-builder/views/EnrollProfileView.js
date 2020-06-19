import { loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals/BaseFooter';
import RemediationEnum from '../../ion/RemediationEnum';

const Body = BaseForm.extend({
  title () {
    return loc('registration.form.title', 'login');
  },

  save: loc('registration.form.submit', 'login'),
});

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    if (this.options.appState.hasRemediationObject(RemediationEnum.FORMS.SELECT_IDENTIFY)) {
      links.push({
        'type': 'link',
        'label': loc('haveaccount', 'login'),
        'name': 'back',
        'actionPath': RemediationEnum.FORMS.SELECT_IDENTIFY,
      });
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer
});

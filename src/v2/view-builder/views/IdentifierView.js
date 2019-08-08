import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';
import BaseFooter from '../internals//BaseFooter';

const Body = BaseForm.extend({
  title: loc('primaryauth.title'),
  save: loc('oform.next', 'login'),
});

const Footer = BaseFooter.extend({
  links () {
    const baseUrl = this.options.settings.get('baseUrl');
    let href = baseUrl + '/help/login';
    if (this.options.settings.get('helpLinks.help') ) {
      href = this.options.settings.get('helpLinks.help');
    }
    return [
      {
        'name': 'help',
        'label': 'Need help signing in?',
        'href': href,
      },
      {
        'type': 'link',
        'label': 'Sign up',
        'name': 'enroll',
        'actionPath': 'enroll',
      }
    ];
  }
});

export default BaseView.extend({
  Body,
  Footer,
});

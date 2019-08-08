import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';
import BaseFooter from '../internals//BaseFooter';

const Body = BaseForm.extend({
  title () {
    return loc('registration.form.title', 'login');
  },

  save: loc('registration.form.submit', 'login'),
});

const Footer = BaseFooter.extend({
  links: [
    {
      'type': 'link',
      'label': 'Back to sign in',
      'name': 'back',
      'href': '/'
    }
  ],
});

export default BaseView.extend({
  Body,
  Footer
});

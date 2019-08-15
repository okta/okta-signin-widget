import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';

const Body = BaseForm.extend({

  title: loc('factor.password', 'login'),

  save: loc('mfa.challenge.verify', 'login'),
});

const Footer = BaseFooter.extend({
  links: [
    {
      'type': 'link',
      'label': 'Forgot Password',
      'name': 'forgot-password',
      'actionPath': 'factor.recovery',
    }
  ],
});

export default BaseView.extend({
  Body,
  Footer,
});

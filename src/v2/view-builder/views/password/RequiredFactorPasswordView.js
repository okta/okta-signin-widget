import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';

const Body = BaseForm.extend({

  title: loc('factor.password', 'login'),

  save: loc('mfa.challenge.verify', 'login'),
});

const Footer = BaseFooter.extend({
  links: function () {
    var links = [
      {
        'type': 'link',
        'label': 'Forgot Password',
        'name': 'forgot-password',
        'actionPath': 'factor.recovery',
      }
    ];
    // if there are 2 forms, the second form is the switch factor form
    if (this.options.appState.hasRemediationForm('switch-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'actionPath': 'switch-factor',
      });
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer,
});

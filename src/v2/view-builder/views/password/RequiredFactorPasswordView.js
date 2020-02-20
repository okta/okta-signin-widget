import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';

const recoveryLinkAction = 'factor-recover';

const Body = BaseForm.extend({

  title: loc('factor.password', 'login'),

  save: loc('mfa.challenge.verify', 'login'),
});

const Footer = BaseFooter.extend({
  links: function () {
    // recovery link
    var links = [];

    if (this.options.appState.getActionByPath(recoveryLinkAction)) {
      links.push({
        'type': 'link',
        'label': 'Forgot Password',
        'name': 'forgot-password',
        'actionPath': recoveryLinkAction,
      });
    }
    // check if we have a select-factor form in remediation, if so add a link
    if (this.options.appState.hasRemediationForm('select-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'formName': 'select-factor',
      });
    }
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer,
});

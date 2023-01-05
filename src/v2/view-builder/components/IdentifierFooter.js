import { loc, View } from '@okta/courage';
import { BaseFooter } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { getForgotPasswordLink, getSignUpLink } from '../utils/LinksUtil';
import Link from './Link';
import hbs from '@okta/handlebars-inline-precompile';

export default BaseFooter.extend({

  showForgotPasswordLink() { 
    return !this.options.appState.isIdentifierOnlyView();
  },

  footerInfo() {
    const signUpLinkData = getSignUpLink(this.options.appState, this.options.settings);
    let SignUpLinkWithText;
    //Build sign up link view appended with a text. Link class can only build anchor tags
    if(signUpLinkData.length) {
      SignUpLinkWithText = View.extend({
        className: 'signup-info',
        template: hbs`
          <span>{{i18n code="registration.signup.label" bundle="login"}}</span><span class="signup-link"></span>
          `,
        initialize() {
          this.add(Link, '.signup-link', {
            options: signUpLinkData[0]
          });
        }
      });
    }
    return SignUpLinkWithText;
  },

  links() {
    const { appState, settings } = this.options;

    let helpLinkHref;
    if (settings.get('helpLinks.help')) {
      helpLinkHref = settings.get('helpLinks.help');
    } else {
      const baseUrl = settings.get('baseUrl');
      helpLinkHref = baseUrl + '/help/login';
    }

    const helpLink = [
      {
        'name': 'help',
        'label': loc('help', 'login'),
        'href': helpLinkHref,
      },
    ];

    let forgotPasswordLink = []; 
    if (this.showForgotPasswordLink()) {
      forgotPasswordLink = getForgotPasswordLink(appState, settings);
    }

    const customHelpLinks = [];
    if (settings.get('helpLinks.custom')) {
      //add custom helpLinks
      settings.get('helpLinks.custom').forEach(customHelpLink => {
        customHelpLink.name = 'custom';
        customHelpLink.label = customHelpLink.text;
        customHelpLinks.push(customHelpLink);
      });
    }

    const unlockAccountLink = [];
    if (settings.get('helpLinks.unlock')) {
      unlockAccountLink.push({
        'type': 'link',
        'label': loc('unlockaccount', 'login'),
        'name' : 'unlock',
        'href': settings.get('helpLinks.unlock'),
      });
    } else if (appState.hasRemediationObject(RemediationForms.UNLOCK_ACCOUNT)) {
      unlockAccountLink.push({
        'type': 'link',
        'label': loc('unlockaccount', 'login'),
        'name' : 'unlock',
        'actionPath': RemediationForms.UNLOCK_ACCOUNT,
      });
    }

    return forgotPasswordLink
      .concat(unlockAccountLink)
      .concat(helpLink)
      .concat(customHelpLinks);
  }
});

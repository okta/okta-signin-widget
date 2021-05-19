import { loc } from 'okta';
import { BaseFooter } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { getForgotPasswordLink, getSignUpLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
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

    const signUpLink = getSignUpLink(appState, settings);

    let forgotPasswordLink = [];
    if (!appState.isIdentifierOnlyView()) {
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
      .concat(signUpLink)
      .concat(helpLink)
      .concat(customHelpLinks);
  }
});

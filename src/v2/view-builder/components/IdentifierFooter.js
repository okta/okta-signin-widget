import { loc } from 'okta';
import { BaseFooter } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { getForgotPasswordLink, getSignUpLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
  links() {
    let helpLinkHref;
    if (this.options.settings.get('helpLinks.help')) {
      helpLinkHref = this.options.settings.get('helpLinks.help');
    } else {
      const baseUrl = this.options.settings.get('baseUrl');
      helpLinkHref = baseUrl + '/help/login';
    }

    const helpLink = [
      {
        'name': 'help',
        'label': loc('help', 'login'),
        'href': helpLinkHref,
      },
    ];

    const signUpLink = getSignUpLink(this.options.appState, this.options.settings);

    const forgotPasswordLink = getForgotPasswordLink(this.options.appState, this.options.settings);

    const customHelpLinks = [];
    if (this.options.settings.get('helpLinks.custom')) {
      //add custom helpLinks
      this.options.settings.get('helpLinks.custom').forEach(customHelpLink => {
        customHelpLink.name = 'custom';
        customHelpLink.label = customHelpLink.text;
        customHelpLinks.push(customHelpLink);
      });
    }

    const unlockAccountLink = [];
    if (this.options.appState.hasRemediationObject(RemediationForms.UNLOCK_ACCOUNT)) {
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

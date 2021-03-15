import { loc, _ } from 'okta';
import { BaseFooter } from '../internals';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import { getForgotPasswordLink } from '../utils/LinksUtil';

export default BaseFooter.extend({
  links () {
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

    const signupLink = [];
    if (this.options.appState.hasRemediationObject(RemediationForms.SELECT_ENROLL_PROFILE)) {
      const signupLinkData = {
        'type': 'link',
        'label': loc('signup', 'login'),
        'name': 'enroll',
      };
      if (_.isFunction(this.options.settings.get('registration.click'))) {
        signupLinkData.click = this.options.settings.get('registration.click');
      } else {
        signupLinkData.actionPath = RemediationForms.SELECT_ENROLL_PROFILE;
      }
      signupLink.push(signupLinkData);
    }

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
      .concat(signupLink)
      .concat(helpLink)
      .concat(customHelpLinks);
  }
});
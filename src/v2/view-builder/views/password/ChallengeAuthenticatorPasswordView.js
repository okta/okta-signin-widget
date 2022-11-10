import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import AuthenticatorFooter from '../../components/AuthenticatorFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getForgotPasswordLink } from '../../utils/LinksUtil';
import { isCustomizedI18nKey } from '../../../ion/i18nTransformer';


const Body = BaseForm.extend({

  title: function() {
    return loc('oie.password.challenge.title', 'login');
  },

  save: function() {
    return loc('mfa.challenge.verify', 'login');
  },

  /**
   * Update UI schemas for customization from .widgetrc.js or Admin Customization settings page.
   * @returns Array
   */
  getUISchema() {
    const schemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    const { settings } = this.options;
    const passwordExplainLabeli18nKey = 'primaryauth.password.tooltip';

    const passwordSchema = schemas.find(({name}) => name === 'credentials.passcode');

    if (passwordSchema && isCustomizedI18nKey(passwordExplainLabeli18nKey, settings)) {
      passwordSchema.explain = loc(passwordExplainLabeli18nKey, 'login');
      passwordSchema['explain-top'] = true;
    }

    return schemas;
  },

});

const Footer = AuthenticatorFooter.extend({
  links: function() {
    let links = AuthenticatorFooter.prototype.links.apply(this, arguments);

    links = getForgotPasswordLink(this.options.appState, this.options.settings).concat(links);

    return links;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});

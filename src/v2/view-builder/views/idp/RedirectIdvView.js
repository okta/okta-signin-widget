import { loc, View } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView } from './BaseIdpAuthenticator';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFooter } from 'v2/view-builder/internals';
import { getHelpLinks, getIdvName } from '../../utils/IdpUtil';

const PrivacyTermsFooterView = View.extend({
  tagName: 'p',
  className: 'privacy-footer',
  template: hbs`
      <p>{{i18n code="oie.idv.idp.desc.termsOfUse" bundle="login" arguments="idpName"
        $1="<a class='inline-link' data-se='terms-of-use'
          target='_blank' rel='noopener noreferrer'>$1</a>"
        $2="<a class='inline-link' data-se='privacy-policy'
           target='_blank' rel='noopener noreferrer'>$2</a>"}}
      </p>
      <p>{{i18n code="oie.idv.idp.desc.agreement" bundle="login" arguments="idpName"}}</p>
    `,
  getTemplateData() {
    const idpName = getIdvName(this.options.appState.get('remediations'));
    return {
      idpName,
    };
  },

});

const Body = BaseIdPAuthenticatorBody.extend({
  title() {
    return loc('oie.idv.idp.title', 'login', [getIdvName(this.options.appState.get('remediations'))]);
  },
  subtitle() {
    return loc('oie.idv.idp.desc', 'login', [getIdvName(this.options.appState.get('remediations'))]);
  },
  save() {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
});

export default BaseIdpAuthenticatorView.extend({
  Body,
  Footer: BaseFooter.extend({
    postRender() {
      this.add(PrivacyTermsFooterView);
      const { termsOfUse, privacyPolicy} = getHelpLinks(this.options.appState.get('remediations'));
      this.$el.find('[data-se="terms-of-use"]').attr('href', termsOfUse);
      this.$el.find('[data-se="privacy-policy"]').attr('href', privacyPolicy);
    }
  }),
});

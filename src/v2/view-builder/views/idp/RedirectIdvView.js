import { loc, View } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView } from './BaseIdpAuthenticator';
import { FORMS } from 'v2/ion/RemediationConstants';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFooter } from 'v2/view-builder/internals';

const PrivacyTermsFooterView = View.extend({
  tagName: 'p',
  className: 'privacy-footer',
  template: hbs`
      <p>{{i18n code="oie.idv.idp.description.termsOfUse" bundle="login" 
        $1="<a href='https://withpersona.com/legal/terms-of-use' class='inline-link' data-se='terms-of-use'
          target='_blank' rel='noopener noreferrer'>$1</a>"
        $2="<a href='https://withpersona.com/legal/privacy-policy' class='inline-link' data-se='privacy-policy'
           target='_blank' rel='noopener noreferrer'>$2</a>"}}
      </p>
      <p>{{i18n code="oie.idv.idp.description.agreement" bundle="login"}}</p>
    `
});

const Body = BaseIdPAuthenticatorBody.extend({
  title() {
    const redirectIDVerifyRemediation = this.options.appState.get('remediations').find((remediation) => {
      return remediation.name === FORMS.REDIRECT_IDVERIFY;
    });
    return loc('oie.idv.idp.title', 'login', [redirectIDVerifyRemediation.idp.name]);
  },
  subtitle() {
    return loc('oie.idv.idp.description', 'login');
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
    }
  }),
});

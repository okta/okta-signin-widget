import { loc, View } from '@okta/courage';
import { BaseIdPAuthenticatorBody, BaseIdpAuthenticatorView } from './BaseIdpAuthenticator';
import { FORMS } from 'v2/ion/RemediationConstants';
import hbs from '@okta/handlebars-inline-precompile';

const SubtitleView = View.extend({
  tagName: 'p',
  className: 'okta-form-subtitle',
  attributes: {
    'data-se': 'o-form-explain',
  },
  template: hbs`
      <p class="margin-btm-30">{{i18n code="oie.idv.idp.description" bundle="login"}}</p>
      <p class="o-form-explain margin-btm-5">{{i18n code="oie.idv.idp.description.termsOfUse" bundle="login" 
        $1="<a href='https://withpersona.com/legal/terms-of-use' class='terms-of-use' 
          target='_blank' rel='noopener noreferrer'>$1</a>"
        $2="<a href='https://withpersona.com/legal/privacy-policy' class='privacy-policy'
           target='_blank' rel='noopener noreferrer'>$2</a>"}}
      </p>
      <p class="o-form-explain">{{i18n code="oie.idv.idp.description.agreement" bundle="login"}}</p>
    `
});

const Body = BaseIdPAuthenticatorBody.extend({
  initialize() {
    BaseIdPAuthenticatorBody.prototype.initialize.apply(this, arguments);
    this.add(SubtitleView);
  },
  title() {
    const redirectIDVerifyRemediation = this.options.appState.get('remediations').find((remediation) => {
      return remediation.name === FORMS.REDIRECT_IDVERIFY;
    });
    return loc('oie.idv.idp.title', 'login', [redirectIDVerifyRemediation.idp.name]);
  },
  save() {
    return loc('oie.optional.authenticator.button.title', 'login');
  },
});

export default BaseIdpAuthenticatorView.extend({
  Body
});

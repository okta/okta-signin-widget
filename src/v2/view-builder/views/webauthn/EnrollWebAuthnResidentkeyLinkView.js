import { View } from 'okta';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'setup-webauthn-residentkey-text',
  template: hbs `<div>{{{i18n code="oie.enroll.webauthn.rk.link" bundle="login"}}}</div>`,
  events: {
    'click .setup-webauthn-residentkey-link': function(e) {
      e.preventDefault();
      this.options.appState.trigger('invokeAction', RemediationForms.ENROLL_WEBAUTHN_RESIDENTKEY);
    },
  },
});

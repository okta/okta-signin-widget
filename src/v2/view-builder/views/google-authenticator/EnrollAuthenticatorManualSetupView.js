import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'oie-enroll-google-authenticator-manual-setup',
  template: hbs`
      <div class="google-authenticator-setup-info-title manual-setup-title">
        {{i18n code="oie.enroll.google_authenticator.cannotScanBarcode.title" bundle="login"}}
      </div>
      <p class="google-authenticator-setup-info">
          {{i18n code="oie.enroll.google_authenticator.manualSetupInstructions" bundle="login"}}
      </p>
    `,
});

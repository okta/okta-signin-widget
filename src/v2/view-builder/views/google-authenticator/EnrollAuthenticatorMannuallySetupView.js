import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'oie-enroll-google-authenticator-manual-setup',
  template: hbs`
      <div class="qrcode-info-title">{{i18n code="oie.enroll.google_authenticator.cannotScanBarcode.title" bundle="login"}}</div>
      <p class="qrcode-info">
          {{i18n code="oie.enroll.google_authenticator.manualSetupInstructions" bundle="login"}}
      </p>
    `,
});




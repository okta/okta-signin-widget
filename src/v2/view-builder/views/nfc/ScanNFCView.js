import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

// Jake perhaps we can just reuse this for the initial phase of enrollment?
const ScanNfcView = View.extend({
  initialize() {
    this.listenTo(this.options.appState, 'hideScanNfc', () => {
      this.hide();
    });
  },
  className: 'scan-nfc',
  template: hbs`
        <div class="okta-form-infobox-warning infobox infobox-warning">
        <span class="icon warning-16"></span>
        <p>{{i18n
            code="oie.nfc.scan"
            bundle="login"
            $1="<a href='#' class='resend-number-challenge'>$1</a>"}}
        </p>
        </div>
    `,
  hide() {
    this.$el.addClass('hide');
  }
});

export default ScanNfcView;
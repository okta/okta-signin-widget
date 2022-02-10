import Expect from 'helpers/util/Expect';
import Form from './Form';
const CLASS_SELECTOR = '.barcode-push';
const QRCODE = 'qrcode';
const MANUAL_SETUP_LINK = 'manual-setup';
const REFRESH_QRCODE_LINK = 'refresh-qrcode';
const SCAN_FORM = 'step-scan';
const REFRESH_LINK = 'refresh-qrcode';
export default Form.extend({
  isEnrollTotpBarcodeForm: function() {
    return this.container().length === 1;
  },

  form: function() {
    return this.el(SCAN_FORM);
  },

  container: function() {
    return this.$(CLASS_SELECTOR);
  },

  qrcodeImg: function() {
    return this.el(QRCODE);
  },

  manualSetupLink: function() {
    return this.el(MANUAL_SETUP_LINK);
  },

  clickManualSetupLink: function() {
    this.manualSetupLink().click();
  },

  refreshQrcodeLink: function() {
    return this.el(REFRESH_QRCODE_LINK);
  },

  scanInstructions: function() {
    return this.$('.scan-instructions');
  },

  hasRefreshQrcodeLink: function() {
    return this.scanInstructions().hasClass('qrcode-expired');
  },

  hasManualSetupLink: function() {
    const instructions = this.scanInstructions();

    return !instructions.hasClass('qrcode-expired') && !instructions.hasClass('qrcode-success');
  },

  clickrefreshQrcodeLink: function() {
    this.refreshQrcodeLink().click();
  },

  backLink: function() {
    return this.el('back-link');
  },

  clickBackLink: function() {
    this.backLink().click();
  },

  refreshLink: function() {
    return this.el(REFRESH_LINK);
  },

  clickRefreshLink: function() {
    return this.refreshLink().click();
  },

  waitForRefreshQrcodeLink: function(resolveValue) {
    return Expect.wait(this.hasRefreshQrcodeLink.bind(this), resolveValue);
  },
});

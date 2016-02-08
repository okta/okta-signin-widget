define(['./Form'], function (Form) {

  var CLASS_SELECTOR = '.barcode-push';
  var QRCODE = 'qrcode';
  var MANUAL_SETUP_LINK = 'manual-setup';
  var REFRESH_QRCODE_LINK = 'refresh-qrcode';
  var SCAN_FORM = 'step-scan';
  var REFRESH_LINK = 'refresh-qrcode';

  return Form.extend({

    form: function () {
      return this.el(SCAN_FORM);
    },

    container: function () {
      return this.$(CLASS_SELECTOR);
    },

    qrcodeImg: function () {
      return this.el(QRCODE);
    },

    manualSetupLink: function () {
      return this.el(MANUAL_SETUP_LINK);
    },

    clickManualSetupLink: function () {
      this.manualSetupLink().click();
    },

    refreshQrcodeLink: function () {
      return this.el(REFRESH_QRCODE_LINK);
    },

    scanInstructions: function () {
      return this.$('.scan-instructions');
    },

    hasRefreshQrcodeLink: function () {
      return this.scanInstructions().hasClass('qrcode-expired');
    },

    hasManualSetupLink: function () {
      var instructions = this.scanInstructions();
      return !instructions.hasClass('qrcode-expired') && !instructions.hasClass('qrcode-success');
    },

    clickrefreshQrcodeLink: function () {
      this.refreshQrcodeLink().click();
    },

    backLink: function () {
      return this.el('back-link');
    },

    clickBackLink: function () {
      this.backLink().click();
    },

    refreshLink: function () {
      return this.el(REFRESH_LINK);
    },

    clickRefreshLink: function () {
      return this.refreshLink().click();
    }

  });

});

define(['./Form'], function (Form) {

  var DEVICE_TYPE = '__deviceType__';
  var APP_DOWNLOAD_INSTRUCTIONS = 'app-download-instructions';

  return Form.extend({

    deviceTypeOptions: function () {
      return this.input(DEVICE_TYPE);
    },

    deviceTypeOptionLabel: function (val) {
      return this.$('[data-se-name="' + DEVICE_TYPE + '"][value="' + val + '"] + label');
    },

    appDownloadInstructions: function () {
      return this.el(APP_DOWNLOAD_INSTRUCTIONS);
    },

    appDownloadInstructionsAppLogo: function (selector) {
      return this.appDownloadInstructions().find(selector);
    },

    appDownloadInstructionsLinkText: function () {
      return this.appDownloadInstructions().find('a').text().trim();
    },

    selectDeviceType: function (val) {
      var options = this.deviceTypeOptions();
      options.filter('[value="' + val + '"]').click();
    },

    backLink: function () {
      return this.el('back-link');
    }

  });

});

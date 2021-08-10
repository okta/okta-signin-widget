import Form from './Form';
const DEVICE_TYPE = '__deviceType__';
const APP_DOWNLOAD_INSTRUCTIONS = 'app-download-instructions';
export default Form.extend({
  deviceTypeOptions: function() {
    return this.input(DEVICE_TYPE);
  },

  deviceTypeOptionLabel: function(val) {
    return this.$('[data-se-name="' + DEVICE_TYPE + '"][value="' + val + '"] + label');
  },

  appDownloadInstructions: function() {
    return this.el(APP_DOWNLOAD_INSTRUCTIONS);
  },

  appDownloadInstructionsAppLogo: function(selector) {
    return this.appDownloadInstructions().find(selector);
  },

  appDownloadInstructionsLinkText: function() {
    return this.appDownloadInstructions().find('a').text().trim();
  },

  appDownloadInstructionsLink: function() {
    return this.appDownloadInstructions().find('a');
  },

  selectDeviceType: function(val) {
    const options = this.deviceTypeOptions();

    options.filter('[value="' + val + '"]').click();
  },

  backLink: function() {
    return this.el('back-link');
  },
});

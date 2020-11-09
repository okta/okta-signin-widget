import Form from '../Form';

const COPY_BUTTON_CLASS = '.copy-clipboard-button';

export default Form.extend({
  getBeaconClass: function () {
    return this.$('.siw-main-header .beacon-container [data-se="factor-beacon"]').attr('class');
  },

  getContentText: function () {
    return this.$('.siw-main-body .o-form-fieldset-container').text();
  },

  getAppStoreLink: function () {
    return this.$('.siw-main-body .o-form-fieldset-container a').attr('href');
  },

  getAppStoreLogo: function () {
    return this.$('.siw-main-body .o-form-fieldset-container a .app-store-logo').attr('class');
  },

  getCopyButtonLabel: function () {
    return this.$('.siw-main-body .o-form-fieldset-container ' + COPY_BUTTON_CLASS).text();
  },

  getCopiedValue: function () {
    return this.$('.siw-main-body .o-form-fieldset-container ' + COPY_BUTTON_CLASS).attr('data-clipboard-text');
  },
});
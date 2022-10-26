import Form from './Form';
export default Form.extend({

  consentTitle: function() {
    return this.$('.consent-title');
  },

  clientLogo: function() {
    return this.consentTitle().find('.client-logo');
  },

  clientLogoLink: function() {
    return this.consentTitle().find('.client-logo-link');
  },

  clientName: function() {
    return this.$('.title-text > b');
  },

  consentTitleText: function() {
    return this.$('.title-text > p');
  },

  consentDescription: function() {
    return this.$('.consent-description');
  },

  scopeCheckBoxLabels: function() {
    return this.$('label');
  },

  disabledScopeCheckBoxLabels: function() {
    return this.$(':disabled ~ label');
  },

  scopeCheckBoxes: function() {
    return this.$('input[type=\'checkbox\']');
  },

  scopeCheckBox: function(name) {
    return this.$(`input[name="${name}"]`);
  },

  termsOfService: function() {
    return this.$('.consent-footer .terms-of-service');
  },

  privacyPolicy: function() {
    return this.$('.consent-footer .privacy-policy');
  },

  consentButton: function() {
    return this.$('.granular-consent input[data-type="save"]');
  },

  cancelButton: function() {
    return this.$('.granular-consent input[data-type="cancel"]');
  },
});
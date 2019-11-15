define(['./Form'], function (Form) {

  return Form.extend({

    consentTitle: function () {
      return this.$('.consent-title');
    },

    clientLogo: function () {
      return this.consentTitle().find('.client-logo');
    },

    clientLogoLink: function () {
      return this.consentTitle().find('.client-logo-link');
    },

    scopeList: function () {
      return this.$('.scope-list');
    },

    termsOfService: function () {
      return this.$('.consent-footer .terms-of-service');
    },

    privacyPolicy: function () {
      return this.$('.consent-footer .privacy-policy');
    },

    consentButton: function () {
      return this.$('.consent-required input[data-type="save"]');
    },

    cancelButton: function () {
      return this.$('.consent-required input[data-type="cancel"]');
    }
  });

});

define(['./Form'], function (Form) {

  return Form.extend({

    userLogo: function () {
      return this.$('.user-logo');
    },

    clientLogo: function () {
      return this.$('.client-logo');
    },

    scopeList: function () {
      return this.$('.scope-list-wrapper');
    },

    consentTitle: function () {
      return this.$('.consent-title');
    },

    termsOfService: function () {
      return this.$('.terms-of-service');
    },

    privacyPolicy: function () {
      return this.$('.privacy-policy');
    },

    consentButton: function() {
      return this.$('.consent-required input[data-type="save"]');
    },

    cancelButton: function() {
      return this.$('.consent-required input[data-type="cancel"]');
    }
  });
});

import Form from './Form';


export default Form.extend({

  consentTitle: function () {
    return this.$('.consent-title');
  },

  consentTitleText: function () {
    return this.consentTitle().find('.title-text').text().trim();
  },

  consentIssuer: function () {
    return this.consentTitle().find('.issuer');
  },

  clientLogo: function () {
    return this.consentTitle().find('.client-logo');
  },

  clientLogoLink: function () {
    return this.consentTitle().find('.client-logo-link');
  },

  scopeGroupList: function () {
    return this.$('.scope-group');
  },

  scopeGroupListRow: function (index) {
    return this.$(`.scope-group:eq(${index})`);
  },

  scopeGroupName: function (index) {
    return this.scopeGroupListRow(index).find('.scope-group--header h3').text();
  },

  scopeNames: function (index) {
    return this.scopeGroupListRow(index).find('.scope-item-text')
      .map(function () {
        return this.innerText;
      })
      .get();
  },

  consentDescription: function () {
    return this.$('.o-form-content .consent-description');
  },

  consentButton: function () {
    return this.$('.admin-consent-required input[data-type="save"]');
  },

  cancelButton: function () {
    return this.$('.admin-consent-required input[data-type="cancel"]');
  }
});


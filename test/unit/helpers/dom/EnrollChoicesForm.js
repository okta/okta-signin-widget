define(['okta', './Form'], function (Okta, Form) {

  var { _, $ } = Okta;

  return Form.extend({

    factorRow: function (factorName) {
      return this.el(factorName);
    },

    factorDescription: function (factorName) {
      return this.factorRow(factorName).find('.enroll-factor-description');
    },

    factorIconClass: function (factorName) {
      var $el = this.factorRow(factorName).find('.enroll-factor-icon');
      var className = $el.attr('class').replace('enroll-factor-icon', '').replace(/\s\s+/g, ' ');
      return $.trim(className);
    },

    factorTitle: function (factorName) {
      return this.factorDescription(factorName).find('h3').trimmedText();
    },

    factorSubtitle: function (factorName) {
      return this.factorDescription(factorName).find('p').trimmedText();
    },

    factorButton: function (factorName) {
      return this.factorRow(factorName).find('.button');
    },

    isFactorMinimized: function (factorName) {
      return this.factorRow(factorName).hasClass('enroll-factor-row-min');
    },

    factorHasSuccessCheck: function (factorName) {
      return this.factorRow(factorName).find('.success-16-green').length > 0;
    },

    factorHasPendingCheck: function (factorName) {
      return this.factorRow(factorName).find('.success-16-gray').length > 0;
    },

    requiredFactorList: function () {
      return this.$('.enroll-required-factor-list');
    },

    requiredFactorListTitle: function () {
      return this.requiredFactorList().find('.list-title').trimmedText();
    },

    requiredFactorListSubtitle: function () {
      return this.requiredFactorList().find('.list-subtitle').trimmedText();
    },

    enrolledFactorList: function () {
      var lists = this.$('.enroll-factor-list');
      return lists.length === 2 ? lists.eq(0) : $();
    },

    enrolledFactorListTitle: function () {
      return this.enrolledFactorList().find('.list-title').trimmedText();
    },

    optionalFactorList: function () {
      var lists = this.$('.enroll-factor-list').not('.enroll-required-factor-list');
      return lists.length === 2 ? lists.eq(1) : lists.eq(0);
    },

    optionalFactorListTitle: function () {
      return this.optionalFactorList().find('.list-title').trimmedText();
    },

    getFactorList: function() {
      var factorRows = this.$('.enroll-factor-list .enroll-factor-row');
      return _.map(factorRows, function (row) {
        return $(row).attr('data-se');
      });
    }

  });

});

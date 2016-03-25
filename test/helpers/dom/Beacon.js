define(['underscore', 'jquery', './Dom'], function (_, $, Dom) {

  return Dom.extend({

    beacon: function () {
      var beacon = this.securityBeacon();
      if (!beacon.length) {
        beacon = this.factorBeacon();
      }
      if (!beacon.length) {
        beacon = this.loadingBeacon();
      }
      return beacon;
    },

    loadingBeacon: function () {
      return this.el('loading-beacon');
    },

    isLoadingBeacon: function () {
      return this.loadingBeacon().length === 1;
    },

    securityBeacon: function () {
      return this.el('security-beacon');
    },

    isSecurityBeacon: function () {
      return this.securityBeacon().length === 1;
    },

    factorBeacon: function () {
      return this.el('factor-beacon');
    },

    isFactorBeacon: function () {
      return this.factorBeacon().length === 1;
    },

    getBeaconImage: function () {
      return this.beacon().css('background-image');
    },

    hasClass: function (className) {
      return this.beacon().hasClass(className);
    },

    getOptionsContainer: function () {
      return this.$('[data-type="factor-types-dropdown"]');
    },

    getOptionsList: function () {
      return this.getOptionsContainer().find('div.options');
    },

    getOptionsLinks: function () {
      // first one is explain text
      return this.getOptionsContainer().find('a:gt(1)');
    },

    getOptionsLinksText: function () {
      return _.map(this.getOptionsLinks(), function (link) {
        return $(link).trimmedText();
      });
    },

    dropDownButton: function () {
      return this.getOptionsContainer().find('.link-button');
    }

  });

});

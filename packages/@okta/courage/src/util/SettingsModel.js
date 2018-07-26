define(['okta/underscore', 'shared/models/Model'], function (_, Model) {

  /**
   * @class SettingsModel
   * @extends {Okta.Model}
   * @private
   */

  return Model.extend({
    local: function () {
      var settings = (window.okta && window.okta.settings) || {};
      return {
        orgId: ['string', false, settings.orgId],
        orgName: ['string', false, settings.orgName],
        serverStatus: ['string', false, settings.serverStatus],
        persona: ['string', false, settings.persona],
        isDeveloperConsole: ['boolean', false, settings.isDeveloperConsole],
        isPreview: ['boolean', false, settings.isPreview],
        permissions: ['array', true, settings.permissions || []]
      };
    },

    extraProperties: true,

    constructor: function () {
      this.features = window._features || [];
      Model.apply(this, arguments);
    },

    /**
     * Checks if the user have a feature flag enabled (Based of the org level feature flag)
     * @param  {String}  feature Feature name
     * @return {Boolean}
     */
    hasFeature: function (feature) {
      return _.contains(this.features, feature);
    },

    /**
     * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
     * @param  {Array}  featureArray Features names
     * @return {Boolean} true if any of the give features are enabled. False otherwise
     */
    hasAnyFeature: function (featureArray) {
      return _.some(featureArray, this.hasFeature, this);
    },

    /**
     * Checks if the user have a specific permission (based on data passed from JSP)
     * @param  {String}  permission Permission name
     * @return {Boolean}
     */
    hasPermission: function (permission) {
      return _.contains(this.get('permissions'), permission);
    }

  });

});

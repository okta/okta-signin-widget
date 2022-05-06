import oktaUnderscore from './underscore-wrapper.js';
import Model from '../models/Model.js';

/**
 * @class SettingsModel
 * @extends {Okta.Model}
 * @private
 */
const props = {
  local: function () {
    const settings = window.okta && window.okta.settings || {};
    const theme = window.okta && window.okta.theme || '';
    return {
      orgId: ['string', false, settings.orgId],
      orgName: ['string', false, settings.orgName],
      serverStatus: ['string', false, settings.serverStatus],
      persona: ['string', false, settings.persona],
      isDeveloperConsole: ['boolean', false, settings.isDeveloperConsole],
      isPreview: ['boolean', false, settings.isPreview],
      permissions: ['array', true, settings.permissions || []],
      theme: ['string', false, theme]
    };
  },
  constructor: function () {
    Model.apply(this, arguments);
    this.features = window._features || [];
  },

  /**
   * Checks if the user have a feature flag enabled (Based of the org level feature flag)
   * @param  {String}  feature Feature name
   * @return {Boolean}
   */
  hasFeature: function (feature) {
    return oktaUnderscore.contains(this.features, feature);
  },

  /**
   * Checks if any of the given feature flags are enabled (Based of the org level feature flags)
   * @param  {Array}  featureArray Features names
   * @return {Boolean} true if any of the give features are enabled. False otherwise
   */
  hasAnyFeature: function (featureArray) {
    return oktaUnderscore.some(featureArray, this.hasFeature, this);
  },

  /**
   * Checks if the user have a specific permission (based on data passed from JSP)
   * @param  {String}  permission Permission name
   * @return {Boolean}
   */
  hasPermission: function (permission) {
    return oktaUnderscore.contains(this.get('permissions'), permission);
  },

  /**
   * Checks if the org has ds theme set
   * @return {Boolean}
   */
  isDsTheme: function () {
    return this.get('theme') === 'dstheme';
  }
};
var SettingsModel = Model.extend(props);

export { SettingsModel as default };

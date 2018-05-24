define([
  'okta/underscore',
  'shared/framework/Model'
],
function (_, Model) {
  /**
   * Wrapper around the more generic {@link src/framework/Model} that
   * contains Okta-specific logic.
   * @class module:Okta.Model
   * @extends src/framework/Model
   */
  return Model.extend(/** @lends module:Okta.Model.prototype */ {

    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    _builtInLocalProps: {
      '__edit__': 'boolean',
      '__pending__': 'boolean'
    },

    constructor: function () {
      this.local = _.defaults({}, _.result(this, 'local'), this._builtInLocalProps);

      if (_.result(this, 'secureJSON')) {
        this.sync = _.wrap(this.sync, function (sync, method, model, options) {
          return sync.call(this, method, model, _.extend({dataType: 'secureJSON'}, options));
        });
      }

      Model.apply(this, arguments);
    }

  });

});

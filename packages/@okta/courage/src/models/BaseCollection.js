define(['okta/underscore', 'shared/framework/Collection'], function (_, Collection) {
  /**
   * Wrapper around the more generic {@link src/framework/Collection} that
   * contains Okta-specific logic.
   * @class module:Okta.Collection
   * @extends src/framework/Collection
   */
  return Collection.extend(/** @lends module:Okta.Collection.prototype */ {

    /**
     * Is the end point using the legacy "secureJSON" format
     * @type {Function|Boolean}
     */
    secureJSON: false,

    constructor: function () {
      if (_.result(this, 'secureJSON')) {
        this.sync = _.wrap(this.sync, function (sync, method, collection, options) {
          return sync.call(this, method, collection, _.extend({dataType: 'secureJSON'}, options));
        });
      }
      Collection.apply(this, arguments);
    }

  });
});

import oktaUnderscore from '../util/underscore-wrapper.js';
import Collection from '../framework/Collection.js';

const baseCollectionProps =
/** @lends module:Okta.Collection.prototype */
{
  /**
   * Is the end point using the legacy "secureJSON" format
   * @type {Function|Boolean}
   */
  secureJSON: false,
  // TODO: may not be simplily moved to initialize as
  // child class override initialize but didn't invoke parent.initialize.
  // need to refactor child classes first.
  constructor: function () {
    Collection.apply(this, arguments);

    if (oktaUnderscore.result(this, 'secureJSON')) {
      this.sync = oktaUnderscore.wrap(this.sync, function (sync, method, collection, options) {
        return sync.call(this, method, collection, oktaUnderscore.extend({
          dataType: 'secureJSON'
        }, options));
      });
    }
  }
};
/**
 * Wrapper around the more generic {@link src/framework/Collection} that
 * contains Okta-specific logic.
 * @class module:Okta.Collection
 * @extends src/framework/Collection
 */

var BaseCollection = Collection.extend(baseCollectionProps);

export { BaseCollection as default };

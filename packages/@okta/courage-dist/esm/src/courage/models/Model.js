import oktaUnderscore from '../util/underscore-wrapper.js';
import FrameworkModel from '../framework/Model.js';

/**
 * Wrapper around the more generic {@link src/framework/Model} that
 * contains Okta-specific logic.
 * @class module:Okta.Model
 * @extends src/framework/Model
 */
var Model = FrameworkModel.extend(
/** @lends module:Okta.Model.prototype */
{
  /**
   * Is the end point using the legacy "secureJSON" format
   * @type {Function|Boolean}
   */
  secureJSON: false,
  _builtInLocalProps: {
    __edit__: 'boolean',
    __pending__: 'boolean'
  },
  preinitialize: function () {
    this.local = oktaUnderscore.defaults({}, oktaUnderscore.result(this, 'local'), this._builtInLocalProps);
    FrameworkModel.prototype.preinitialize.apply(this, arguments);
  },
  constructor: function () {
    FrameworkModel.apply(this, arguments);

    if (oktaUnderscore.result(this, 'secureJSON')) {
      this.sync = oktaUnderscore.wrap(this.sync, function (sync, method, model, options) {
        return sync.call(this, method, model, oktaUnderscore.extend({
          dataType: 'secureJSON'
        }, options));
      });
    }
  }
});

export { Model as default };

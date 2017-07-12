define([
  'okta/underscore',
  'shared/framework/Model'
],
function (_, Model) {

  /**
  * @class Okta.Model
  * @extends Archer.Model
  * @inheritDoc Archer.Model
  */
  return Model.extend({

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

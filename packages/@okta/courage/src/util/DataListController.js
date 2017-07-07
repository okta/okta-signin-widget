define([
  'okta/underscore',
  'shared/util/BaseController'
],
function (_, BaseController) {

  return BaseController.extend({

    /**
     * @class Okta.DataListController
     * @extends {Okta.Controller}
     */

    fetchEvents: 'change',

    constructor: function () {

      this.fetch = _.debounce(this.fetch, 50);
      this.Collection && (this.collection = new this.Collection());

      BaseController.apply(this, arguments);

      this.listenTo(this.state, _.result(this, 'fetchEvents'), function () {
        this.fetch({reset: true});
      });

      // empty the collection upon error, so the data list doesn't display stale results;
      if (this.collection) {
        this.listenTo(this.collection, 'error', function (collection) {
          if (collection === this.collection) {
            this.collection.reset();
          }
        });
      }

      this.fetch({reset: true});
    },

    /**
     * Fetch the collection.
     * The call will be deferred so the controller can render the view before fetching
     */
    fetch: function (options) {
      if (this.collection) {
        this.trigger('fetch', this.state);
        this.collection.fetch(_.extend(_.pick(options || {}, ['reset', 'remove', 'success', 'error', 'data']), {
          data: this.getFetchData()
        }));
      }
    },

    /**
     * The `data` we want to to pass to the fetch call
     * @return {Object}
     * @protected
     */
    getFetchData: function () {
      return this.state.toJSON();
    }

  });

});

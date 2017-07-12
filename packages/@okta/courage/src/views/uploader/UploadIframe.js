define([
  'shared/util/Events',
  'shared/views/BaseView',
  'vendor/lib/json2'
], function (Events, BaseView) {

  var View = BaseView.extend({
    tagName: 'iframe',

    className: 'hide',

    attributes: function () {
      return {
        name: this.options.name,
        id: this.options.name
      };
    },

    events: {
      'load': function () {
        // When the iframe triggers the load event, we know an
        // upload has been completed.  If the contents are empty,
        // it may have been the empty initial load.  Trigger
        // the event on the view because parent view is listening.

        /* global JSON */
        /* eslint no-empty: 0 */
        try {
          var contents = this.$el.contents().text();
          if (contents) {
            this.trigger(Events.UPLOAD_DONE, JSON.parse(contents));
            return;
          }
        }
        catch (e) {}
        this.trigger(Events.UPLOAD_EMPTY_CONTENT);
      }
    }
  });

  return View;
});

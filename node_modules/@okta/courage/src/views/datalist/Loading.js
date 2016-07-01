define([
  'shared/views/components/BaseSpinner'
], function (BaseSpinner) {

  return BaseSpinner.extend({

    className: 'data-list-load-wrap',

    type: 'loading',

    template: '\
      <div class="data-list-load-mask"></div>\
      <h4 class="data-list-head">Loading...</h4>\
    ',

    spinOptions: {
      className: 'data-list-spinner'
    },

    initialize: function () {
      BaseSpinner.prototype.initialize.apply(this, arguments);
      this.listenTo(this.collection, 'request', this.spin);
      this.listenTo(this.collection, 'sync error', this.empty);
    },

    spin: function (src) {
      if (src === this.collection) {
        BaseSpinner.prototype.spin.apply(this, arguments);
      }
    }

  });
});

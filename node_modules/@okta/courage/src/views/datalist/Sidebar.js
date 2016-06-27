define(['shared/views/BaseView'], function (BaseView) {

  return BaseView.extend({

    constructor: function () {
      BaseView.apply(this, arguments);
      this.$el.addClass('data-list-sidebar-wrap');
    },

    height: function () {
      return this.$el.height();
    },

    type: 'sidebar'

  });

});

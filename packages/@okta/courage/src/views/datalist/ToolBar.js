define(['okta/underscore', 'shared/views/BaseView'], function (_, BaseView) {

  return BaseView.extend({
    attributes: {},
    constructor: function () {
      _.defaults(this.attributes, {'data-se': 'data-list-toolbar'});
      BaseView.apply(this, arguments);
      this.$el.addClass('data-list-toolbar clearfix');
    }
  });
});

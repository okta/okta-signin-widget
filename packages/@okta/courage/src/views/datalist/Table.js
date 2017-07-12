define([
  'shared/views/Backbone.TableView',
  './Footer'
],
function (TableView, Footer) {

  return TableView.extend({
    constructor: function () {
      if (!this.footer && this.footer !== false) {
        this.footer = Footer;
      }
      TableView.apply(this, arguments);
      this.$el.addClass('data-list-table');
    }
  });

});

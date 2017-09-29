define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/views/BaseView',
  'shared/views/datalist/components/LoadMore'
],
function (_, TemplateUtil, BaseView, LoadMore) {

  var template = TemplateUtil.tpl('\
    <tr>\
      <td colspan="{{colspan}}"></td>\
    </tr>\
  ');

  var View = BaseView.extend({
    tagName: 'tfoot',

    className: 'data-list-pager-footer',

    LoadMoreView: undefined,

    constructor: function () {
      BaseView.apply(this, arguments);
      this.listenTo(this.collection, 'request', this.empty);
      this.listenTo(this.collection, 'sync reset', _.debounce(this.render, 50));
    },

    render: function () {
      if (this.collection.hasMore()) {
        // Set a large colspan so we can use this for all tables
        var colspan = this.options.colspan || this.colspan || 100;
        this.$el.html(template({colspan: colspan}));

        var MyLoadMoreView = this.LoadMoreView ? this.LoadMoreView : LoadMore;
        this.$('td').html(new MyLoadMoreView(this.options).render().el);
      }
      else {
        this.empty();
      }
      return this;
    },

    empty: function () {
      this.$el.empty();
    }
  });

  return View;

});

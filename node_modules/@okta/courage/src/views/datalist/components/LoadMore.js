define([
  'shared/views/BaseView'
],
function (BaseView) {

  var View = BaseView.extend({

    el: '<a href="#" class="data-list-pager-footer-link"></a>',
    template: '{{i18n code="datalist.show_more"}}',

    events: {
      'click': function (e) {
        e.preventDefault();
        this.collection.fetchMore && this.collection.fetchMore();
      }
    }

  });

  return View;

});
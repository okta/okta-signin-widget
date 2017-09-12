define([
  'okta/jquery',
  'shared/views/BaseView'
],
function ($, BaseView) {

  var View = BaseView.extend({

    el: '<a href="#" class="data-list-pager-footer-link"></a>',
    template: '{{i18n code="datalist.show_more" bundle="courage"}}',

    events: {
      'click': function (e) {
        e.preventDefault();

        if (this.collection.fetchMore) {
          var originalBodyPosition = $('body').css('position');
          $('body').css('position', 'sticky');
          this.collection.fetchMore();
          this.listenToOnce(this.collection, 'sync error', function () {
            $('body').css('position', originalBodyPosition);
          });
        }
      }
    }

  });

  return View;

});
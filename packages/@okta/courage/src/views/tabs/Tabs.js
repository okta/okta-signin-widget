define([
  'shared/views/BaseView',
  './Tab',
  './SubTab'
],
function (BaseView, Tab, SubTab) {

  return BaseView.extend({
    className: 'clearfix ui-tabs ui-widget ui-widget-content ui-corner-all',

    template: '<ul role="tablist" class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ' +
                                        'ui-widget-header ui-corner-all ui-tabs-margin"></ul>' +
              '<div role="subtabs" class="ui-subtabs ui-helper-reset ui-tabs-margin"></div>' +
              '<div role="tabpanel" class="ui-tabs-panel ui-widget-content ui-corner-bottom"></div>',

    content: function () {
      return this.$('div.ui-tabs-panel');
    },

    addTab: function (options) {
      this.add(Tab, 'ul', {options: options});
    },

    addSubTab: function (options) {
      this.add(SubTab, 'div.ui-subtabs', {options: options});
    }
  });

});

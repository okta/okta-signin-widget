define([
  'okta/underscore',
  'shared/views/BaseView'
],
function (_, BaseView) {

  return BaseView.extend({
    tagName: 'li',
    className: 'subtab ui-state-default ui-corner-top',
    attributes: {
      role: 'subtab'
    },
    
    template: '<a class="sub-tab-link ui-tabs-anchor" role="presentation" href="{{route}}">{{label}}</a>',

    events: {
      'click a': function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.router.navigate(this.route, {trigger: true});
      }
    },

    initialize: function () {
      _.extend(this, _.pick(this.options, 'route', 'router', 'method'));
      this.listenTo(this.router, 'route', this.toggle);
    },

    toggle: function (method) {
      
      // if we load a subtab
      this.$el.toggleClass('ui-state-active ui-tabs-selected', method == this.method);
      // show the subtab panel and subtab content
      this.$el.parent().parent().find('.ui-tabs-panel').addClass('subtab-content');
      // show the subtab panel
      this.$el.parent().parent().find('.ui-subtabs').addClass('subtabs-panel');
      
    }
  });

});
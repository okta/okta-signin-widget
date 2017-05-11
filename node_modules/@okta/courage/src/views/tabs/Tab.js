define([
  'okta/underscore',
  'shared/views/BaseView'
],
function (_, BaseView) {

  return BaseView.extend({
    tagName: 'li',
    className: 'ui-state-default ui-corner-top',
    attributes: {
      role: 'tab'
    },

    template: '<a class="ui-tabs-anchor" role="presentation" href="{{route}}">{{label}}</a>',

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
      
      // toggle active parent tab
      this.$el.toggleClass('ui-state-active ui-tabs-selected', method == this.method);
      
      if (this.options.subtabs && this.options.subtabs.length) {   
          // we loaded a subtab within a tab so check the method of each subtab to match that parent 
          // if we find one highlight the parent
        if (method != this.method) {
          _.each(this.options.subtabs, function (subtab) {
            if (subtab.method == method) {
              this.$el.addClass('ui-state-active ui-tabs-selected');
            }
          }, this);
        } else {
          // highlight first tab     
          this.$el.parent().parent().find('.ui-subtabs li:first-child').addClass('ui-state-active ui-tabs-selected');
          //load the first subtab by default
          var firstsubTabRoute = this.options.route + '/' + this.options.subtabs[0].routes;
          this.router.navigate(firstsubTabRoute, {trigger: true});
        }
      } else {
        // hide subtabs div for tabs that dont have subtabs
        this.$el.parent().parent().find('.ui-subtabs').toggle(method != this.method);
      }
    }
  });
});

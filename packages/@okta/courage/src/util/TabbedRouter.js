define([
  'okta/jquery',
  'okta/underscore',
  'shared/views/tabs/Tabs',
  'shared/util/BaseRouter'
],
function ($, _, Tabs, BaseRouter) {

  /**
   * A router that generates a tabbed view where each tab maps to a route.
   * @class module:Okta.TabbedRouter
   * @extends module:Okta.Router
   */
  return BaseRouter.extend(/** @lends module:Okta.TabbedRouter.prototype */ {

    constructor: function (options) {

      this.__hasDefaultRoute = false;

      var tabsWidget = this.__tabsWidget = new Tabs();
      tabsWidget.render();

      // keep a reference to the original "el" to append the whole tabs widget to
      var $el = $(options.el);

      // replace options.el with the content area in the tab widget
      options.el = tabsWidget.content();

      // attach the tab widget to the DOM only when ready
      // to make sure the original "el" is ready
      $(function () {
        $el.append(tabsWidget.el);
      });

      BaseRouter.call(this, options);
    },

    /**
     * Add a tab
     *
     * @param {String|Array} route The route or routes this tab handles
     * @param {String} method The method to invoke when the tab is selected
     * @param {String} label The label to display on the tab
     * @param {Array} subtabs list of subtabs on the tab
     */
    tab: function (route, method, label, subtabs) {
      var routes = _.isArray(route) ? route : [route];
      this.__addTab({routes: routes, method: method, label: label, subtabs: subtabs});
      return this;
    },

    /**
     * Internal method for adding a tab to the widget
     *
     * @param {Object} options Options hash
     * @param {Array} options.routes The routes this tab handles
     * @param {String} options.method The method to invoke when the tab is selected
     * @param {String} options.label The label to display on the tab
     * @param {Array} options.subtabs list of subtabs on the tab
     * @private
     */
    __addTab: function (options) {
      if (!this.__hasDefaultRoute) {
        this.route('', options.method);
        this.__hasDefaultRoute = true;
      }

      // add subtabs
      if (options.subtabs && options.subtabs.length) {
        this.__addSubTabs(_.extend(_.pick(options, 'routes', 'subtabs')));
      }
      _.each(options.routes, function (route) {
        this.route(route, options.method);
      }, this);
      var route = _.first(options.routes);
      this.__tabsWidget.addTab(_.extend(_.pick(options, 'label', 'method', 'subtabs'), {route: route, router: this}));
    },

    /**
     * Internal method for adding subtabs for each tab
     * @param {Object} options hash with routes and subtabs attributes
     * @private
     */
    __addSubTabs: function (options) {
      _.each(options.subtabs, function (subtab) {
        var route = options.routes + '/' + subtab.routes;
        this.route(route, subtab.method);
        this.__tabsWidget.addSubTab(_.extend(_.pick(subtab, 'label', 'method'), {route: route, router: this}));
      }, this);
    }

  });
});

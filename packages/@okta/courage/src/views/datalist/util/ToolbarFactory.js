/* eslint max-params: [2, 6]*/
define([
  'okta/underscore',
  'backbone',
  'shared/util/ButtonFactory',
  'shared/views/datalist/ToolBar',
  'shared/views/datalist/components/SearchBox',
  'shared/views/datalist/components/LettersNav'
],
function (_, Backbone, ButtonFactory, ToolBar, SearchBox, LettersNav) {

  /**
   * @class ToolbarFactory
   * A factory method wrapper for creating a datalist toolbar
   */

  return {
    /**
     * Creates a ToolBar
     * @static
     * @param  {Object[]} components The components to add to the toolbar
     * @return ToolBar The ToolBar
     */
    createToolbar: function (components) {
      var factory = this;
      return ToolBar.extend({
        initialize: function () {
          _.each(components, function (component) {
            this.add(factory.__createComponent(component));
          }, this);
        }
      });
    },

    /**
     * Creates a toolbar component
     * @static
     * @private
     * @param  {Object} options options hash
     * @param  {String} options.type component type. supported values are [button, search, letters]
     * @param  {String} [options.field] field the components operates on. applies to [search, letters]
     * @param  {String} [options.placeholder] placeholder text for the search box
     * @param  {Number} [options.minChars] minChars for the search component
     * @param  {String} [options.align] align of the search component
     * @param  {String} [options.title] title of a button component
     * @param  {String} [options.icon] icon of a button component
     * @param  {String} [options.href] href of a button component
     * @param  {Function} [options.click] click action of a button component
     * @return {Okta.View} The component
     */
    __createComponent: function (options) {
      if (_.isFunction(options) || (_.isObject(options) && options instanceof Backbone.View)) {
        return options; // passthrough for pre-defined views
      }
      switch (options.type) {
      case 'button':
        return ButtonFactory.create(options);
      case 'search':
        return SearchBox.extend({
          initialize: function () {
            _.extend(this.options, _.pick(options, 'field', 'minChars', 'placeholder'), {'float': options.align});
          }
        });
      case 'letters':
        return LettersNav.extend({
          initialize: function () {
            _.extend(this.options, _.pick(options, 'field'));
          }
        });
      default:
        throw new Error('Not Implemented');
      }
    }

  };


});

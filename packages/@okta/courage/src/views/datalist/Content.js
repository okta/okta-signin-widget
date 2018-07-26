define([
  'okta/underscore',
  'shared/views/BaseView',
  './Loading',
  './Empty'
], function (_, BaseView, Loading, Empty) {

  /**
   * @class src/views/datalist/Content
   * @extends module:Okta.View
   */
  return BaseView.extend(/** @lends src/views/datalist/Content.prototype */ {

    /**
     * A custom view to set as the empty view when the collection is empty
     * @type {module:Okta.View}
     */
    Empty: null,

    /**
     * A custom loading animation view
     * @type {module:Okta.View}
     */
    Loading: null,

    template: '<div class="data-list-content" data-se="data-list-content"></div>',

    constructor: function () {
      BaseView.apply(this, arguments);
      if (!this.collection) {
        throw new Error('Missing Arguments: collection');
      }
      this.Toolbar && this.add(this.Toolbar, {prepend: true});
      this.Main && this.add(this.Main);
      var EmptyView = this.Empty || Empty,
          LoadingView = this.Loading || Loading;
      this.add(EmptyView);
      this.add(LoadingView);

      this.$el.addClass('data-list-content-wrap');
      this.$el.attr('data-se', 'data-list-content-wrap');
    },

    add: function () {
      var args = _.toArray(arguments);
      typeof args[1] === 'undefined' && (args[1] = '.data-list-content');
      return BaseView.prototype.add.apply(this, args);
    },

    /**
     * returns or sets the height of the component
     *
     * ```javascript
     * content.height(123); //=> void
     * content.height(); //=> 123
     * ```
     * @param  {Number} [height]
     * @return {Number|void}
     */
    height: function (height) {
      if (height) {
        this.$('.data-list-content').css('min-height', height);
      }
      else {
        return this.$el.height();
      }
    },

    type: 'content'


  });
});

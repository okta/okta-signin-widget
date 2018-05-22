define(['okta/underscore', 'shared/views/BaseView'], function (_, BaseView) {

  /**
   * A low level DataList container
   * @class src/views/datalist/DataList
   * @extends module:Okta.View
   */
  return BaseView.extend(/** @lends src/views/datalist/DataList.prototype */ {

    /**
     * Delay time for resizing
     * @private
     * @type {Number}
     */
    debounceTime: 100,

    constructor: function () {
      BaseView.apply(this, arguments);
      this.$el.addClass('data-list data-list-sidebar-left clearfix');
    },

    render: function () {
      BaseView.prototype.render.apply(this, arguments);
      // run defered to make sure everything renders before we measure
      _.defer(_.bind(this.balance, this));

      if (!this.findWhere({type: 'sidebar'})) {
        this.$el.removeClass('data-list-sidebar-left');
      }

      return this;
    },

    /**
     * Is the content area is not shorter than the sidebar?
     * @todo this should have a better CSS implementation and should not be required in here
     * @return {Boolean}
     */
    balanced: function () {
      this.sidebar = this.findWhere({type: 'sidebar'});
      this.content = this.findWhere({type: 'content'});
      if (!this.sidebar || !this.content) {
        return true;
      }

      return this.sidebar.height() <= this.content.height();
    },

    /**
     * Balance the datalist and make the height of the content area and the sidebar identical
     * @todo this should have a better CSS implementation and should not be required in here
     * @method
     */
    balance: _.debounce(function () {
      this.balanced() || this.content.height(this.sidebar.height() + 30);
    }, this.debounceTime)
  });

});

define([
  'okta/underscore',
  'shared/views/BaseView',
  'shared/util/ViewUtil'
], function (_, BaseView, ViewUtil) {

  var disabledEvents = {
    click: function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /**
   * A configurable button.
   * @class module:Okta.internal.views.components.BaseButtonLink
   * @extends module:Okta.View
   * @example
   * var View = BaseButtonLink.extend({
   *   title: 'Click Me',
   *   icon: 'help-text'
   * })
   */
  return BaseView.extend(/** @lends module:Okta.internal.views.components.BaseButtonLink.prototype */ {

    /**
     * The main text for the button
     * @name title
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * The link for the button
     * @name href
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
     * @name icon
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {(String|Function)}
     * @instance
     */

    /**
     * A [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
     * @name events
     * @memberof module:Okta.internal.views.components.BaseButtonLink
     * @type {Object}
     * @instance
     */

    tagName: 'a',

    template: '{{#if icon}}<span class="icon {{icon}}"></span>{{/if}}{{#if title}}{{title}}{{/if}}',

    /**
     * Make this button visible, default to true.
     * @type {(Boolean|Function)}
     * @default true
     */
    visible: true,

    /**
     * Make this button enabled, default to true.
     * @type {(Boolean|Function)}
     * @default true
     */
    enabled: true,

    /**
     * The setting to determine when the button is enabled, default to {} and
     * enabled takes a higher priority.
     * @type {(Object|Function)}
     * @default {}
     */
    enableWhen: {},

    /**
     * The setting to determine when the button is visible, default to {} and
     * visible takes a higher priority.
     * @type {(Object|Function)}
     * @default {}
     */
    showWhen: {},

    constructor: function (options) {
      this.options = options || {};
      var data = this.getTemplateData();

      this.disabled = false;

      BaseView.apply(this, arguments);

      this.$el.addClass('link-button');
      if (data.icon) {
        this.$el.addClass('link-button-icon');
        if (!data.title) {
          this.$el.addClass('icon-only');
        }
      }
    },

    getTemplateData: function () {
      return {
        href: this.__getAttribute('href'),
        title: this.__getAttribute('title'),
        icon: this.__getAttribute('icon')
      };
    },

    initialize: function () {
      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'enableWhen', this), this.toggle);
      ViewUtil.applyDoWhen(this, _.resultCtx(this, 'showWhen', this), this.toggleVisible);
    },

    render: function () {

      BaseView.prototype.render.apply(this, arguments);

      if (!_.result(this, 'enabled')) {
        this.toggle(false);
      }

      if (!_.result(this, 'visible')) {
        this.toggleVisible(false);
      }

      var data = this.getTemplateData();
      this.$el.attr('href', data.href || '#');

      return this;
    },

    __getAttribute: function (name, defaultValue) {
      var value = _.resultCtx(this.options, name, this);
      if (_.isUndefined(value)) {
        value = _.result(this, name);
      }
      return !_.isUndefined(value) ? value : defaultValue;
    },

    enable: function () {
      this.toggle(true);
    },

    disable: function () {
      this.toggle(false);
    },

    show: function () {
      this.toggleVisible(true);
    },

    hide: function () {
      this.toggleVisible(false);
    },

    toggle: function (enable) {
      //this is to toggle the enability
      var bool = !!enable && _.result(this, 'enabled');
      this.disabled = !bool;
      this.$el.toggleClass('link-button-disabled btn-disabled disabled', this.disabled);

      // delegateEvents asynchronously in case the button is not yet added to the DOM
      // in these cases the alternate events won't work
      _.defer(_.bind(function () {
        this.delegateEvents(this.disabled ? disabledEvents : null);
      }, this));
    },

    toggleVisible: function (visible) {
      var hidden = !visible || !_.result(this, 'visible');
      this.$el.toggleClass('hide', hidden);
    }

  });

});

define([
  'okta/underscore',
  'okta/jquery',
  'shared/views/BaseView',
  'shared/util/ViewUtil'
], function (_, $, BaseView, ViewUtil) {

  $(document).click(function (e) {
    var target = $(e.target),
        isDropDown = (target.hasClass('option-selected') || target.parents().hasClass('option-selected')) &&
          target.closest('.dropdown').length > 0;
    if (!isDropDown) {
      $('.dropdown .options').fadeOut(100);
    }
  });

  var DropDownOption = BaseView.extend({

    tagName: 'li',

    template: '\
      <a class="icon-16{{#unless icon}} no-icon{{/unless}}"{{#if seleniumId}} data-se="{{seleniumId}}"{{/if}}>\
        {{#if icon}}<span class="icon {{icon}}"></span>{{/if}}\
        <p class={{#if title}}"option-title"{{else}}"no-title"{{/if}}>{{title}}</p>\
        {{#if subtitle}}<p class="option-subtitle">{{subtitle}}</p>{{/if}}\
      </a>\
    ',

    className: 'okta-dropdown-option option',

    events: {
      click: function (e) {
        e.preventDefault();
        if (!this.$el.hasClass('option-disabled')) {
          this.options.click && this.options.click.call(this);
        }
        else {
          e.stopPropagation();
        }
      }
    },

    initialize: function () {
      ViewUtil.applyDoWhen(this, _.resultCtx(this.options, 'enableWhen', this), this.toggleEnabled);
      ViewUtil.applyDoWhen(this, _.resultCtx(this.options, 'showWhen', this), this.toggleVisible);
    },

    postRender: function () {
      if (!_.size(_.resultCtx(this.options, 'enableWhen', this))) {
        this.toggleEnabled(true);
      }
      if (!_.size(_.resultCtx(this.options, 'showWhen', this))) {
        this.toggleVisible(true);
      }
    },

    getTemplateData: function () {
      return {
        icon: _.resultCtx(this.options, 'icon', this),
        title: _.resultCtx(this.options, 'title', this),
        subtitle: _.resultCtx(this.options, 'subtitle', this),
        seleniumId: _.resultCtx(this.options, 'seleniumId', this)
      };
    },

    toggleEnabled: function (bool) {
      var enabled = bool && _.resultCtx(this.options, 'enabled', this);
      this.$el.toggleClass('option-disabled', !enabled);
    },

    toggleVisible: function (bool) {
      var visible = bool && _.resultCtx(this.options, 'visible', this);
      this.$el.toggleClass('option-hidden', !visible);
    }

  });

  var events = {
    'click a.option-selected': function (e) {
      e.preventDefault();
      if (_.result(this, 'disabled')) {
        e.stopPropagation();
      } else {
        this.$('div.options').toggle();
      }
    },
    'click .dropdown-disabled': function (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  var ITEM_OPTS = ['icon', 'title', 'subtitle', 'click', 'enableWhen', 'showWhen', 'enabled', 'visible', 'attributes',
    'seleniumId'];

  /**
   * @class Okta.DropDown
   * @extends Okta.View
   *
   * A dropdown component to support dropdown navigation elements, activate/deactivate actions, etc.
   *
   * Should not be confused with a select dropdown - this conponent is not desiend to selet an options from
   * a set of options, but to navigate or to take action.
   *
   * ```javascript
   * Okta.DropDown.extend({
   *   title: 'Change color',
   *   itemWidth: 280,
   *   items: [
   *     {
   *       title: 'Change to green',
   *       subtitle: 'select me to turn green',
   *       icon: 'icon-16-green',
   *       click: function () {
   *         this.state.invoke('turnGreen');
   *       },
   *       enableWhen: {
   *         canChangeColor: true,
   *         color: function (colorValue) {
   *           return colorValue !== 'GREEN';
   *         }
   *       }
   *     },
   *     {
   *       title: 'Change to red',
   *       subtitle: 'select me to turn red',
   *       icon: 'icon-16-red',
   *       click: function () {
   *         this.state.invoke('turnRed');
   *       },
   *       enableWhen: {
   *         canChangeColor: true,
   *         color: function (colorValue) {
   *           return colorValue !== 'RED';
   *         }
   *       }
   *     },
   *   ]
   * });
   * ```
   */
  return BaseView.extend({

    /**
     * List of dropdown itmes for this dropdown
     * Uses {@link Okta.DropDown#addItem} internally
     * @type {Array|Function}
     */
    items: [],

    /**
     * Fixed width of the options
     * @type {Number|Function}
     */
    itemWidth: null,

    /**
     * Fixed width of the drop-down button
     * @type {Number|Function}
     */
    width: null,

    /**
     * Icon of the dropdown top level item
     * @type {String|Function}
     */
    icon: null,

    /**
     * Title of the dropdown top level item
     * @type {String|Function}
     */
    title: null,

    /**
     * Should this dropdown be disabled by default
     * @type {Boolean|Function}
     */
    disabled: false,


    constructor: function () {
      this.events = _.defaults(this.events || {}, events);

      // In this very specific case we want to NOT append className to $el
      // but to the <a> tag in the template
      // so we want to disable backbone default functionality.
      var className = this.className;
      this.className = null;

      // allow adding custom preRender
      this.postRender = _.wrap(this.postRender, _.bind(function (postRender) {
        var itemWidth = _.result(this, 'itemWidth');
        if (itemWidth) {
          this.$('ul.options-wrap').width(itemWidth);
        }

        var width = _.result(this, 'width');
        if (width) {
          this.$('a.option-selected').width(width - 30);
        }

        if (_.result(this, 'disabled')) {
          this.disable();
        }

        postRender.call(this);
      }, this));

      BaseView.apply(this, arguments);

      this.className = className;

      this.$el.addClass('dropdown more-actions float-l');

      _.each(_.result(this, 'items') || [], function (option) {
        this.addItem(option, this.options);
      }, this);
    },

    template: '\
      <a href="#" class="link-button link-button-icon option-selected center {{className}}">\
        {{#if icon}}<span class="icon {{icon}}"></span>{{/if}}\
        {{#if title}}<span class="option-selected-text">{{title}}</span>{{/if}}\
        <span class="icon-dm"></span>\
      </a>\
      <div class="options clearfix">\
        <ul class="okta-dropdown-list options-wrap clearfix"></ul>\
      </div>\
    ',

    getTemplateData: function () {
      return {
        icon: _.result(this, 'icon'),
        className: _.result(this, 'className') || '',
        title: _.result(this, 'title')
      };
    },

    /**
     * Disable the dropdown
     */
    disable: function () {
      this.$('.option-selected').addClass('dropdown-disabled');
    },

    /**
     * Enable the dropdown
     */
    enable: function () {
      this.$('.option-selected').removeClass('dropdown-disabled');
    },

    /**
     * Add a dropdown option
     *
     * ```javascript
     * this.addItem({
     *   title: 'Change to green',
     *   subtitle: function () {
     *     return 'select me to turn green';
     *   },
     *   icon: 'icon-16-green',
     *   attributes: {
     *    'data-se': 'turn-green'
     *   },
     *   click: function () {
     *     this.state.invoke('turnGreen');
     *   },
     *   enableWhen: {
     *     canChangeColor: true,
     *     color: function (colorValue) { // this is identical to this.model.get('color') == 'GREEN'
     *       return colorValue !== 'GREEN';
     *     }
     *   },
     *   showWhen: {
     *     hasPermission: true
     *   }
     * });
     * ```
     * @param {Object} options Options to describe the dropdown option
     * @param {String|Function} options.icon The icon class
     * @param {String|Function} options.title The title text display on the first line of the option
     * @param {String|Function} options.subtitle The subtitle text display on the second line of the option
     * @param {Function} options.click The event handler when the option is enabled and clicked on
     * @param {Boolean|Function} options.enabled=true make this item enabled
     * @param {Object|Function} options.enableWhen The setting to determine when the option is enabled.
     * @param {Boolean|Function} options.visible=true make this item visible
     * @param {Object|Function} options.showWhen The setting to determine when the option is available (visible).
     * @param {String|Function} options.seleniumId a data-se identifier to add to the `<a>` tag of the item
     *
     */
    addItem: function (options) {
      options = _.pick(options || {}, ITEM_OPTS);

      _.defaults(options, {
        visible: true,
        enabled: true
      });

      return this.add(DropDownOption, 'ul.options-wrap', {options: options});
    }

  });

});

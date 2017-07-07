/* eslint max-params: [2, 7]*/
define([
  'okta/underscore',
  'shared/util/ButtonFactory',
  'shared/views/BaseView',
  'shared/views/components/DropDown',
  'shared/util/StringUtil'
],
function (_, ButtonFactory, BaseView, DropDown, StringUtil) {

  return BaseView.extend({

    actionOptions: [],

    title: StringUtil.localize('datalist.column.actions.default.title'),

    threshold: 2,

    __countVisible: function () {
      return _.filter(this.actionOptions, function (option) {
        return _.isUndefined(option.visible) || _.resultCtx(option, 'visible', this);
      }, this).length;
    },

    __addButtons: function () {
      _.each(this.actionOptions, function (option) {
        this.add(ButtonFactory.create(option));
      }, this);
    },

    __addDropDown: function () {
      var ddOptions = this.dropdown || {};
      this.add(DropDown.extend({
        title: ddOptions.title || this.title,
        icon: ddOptions.icon,
        disabled: ddOptions.disabled || false,
        width: ddOptions.width,
        itemWidth: ddOptions.itemWidth || 180,
        items: this.actionOptions
      }));
    },

    render: function () {
      this.removeChildren();

      if (this.__countVisible() <= this.threshold) {
        this.__addButtons();
      } else {
        this.__addDropDown();
      }

      return BaseView.prototype.render.apply(this, arguments);
    }

  });



});

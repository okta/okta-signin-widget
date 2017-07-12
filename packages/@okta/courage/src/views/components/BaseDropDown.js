define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/TemplateUtil',
  'shared/views/BaseView'
],
function (_, $, TemplateUtil, BaseView) {

  var optionsTemplate = TemplateUtil.tpl('\
    <a class="icon-16 {{className}}" data-se="{{seleniumId}}">\
      {{#if icon}}\
      <span class="icon {{icon}}"></span>\
      {{/if}}\
      {{#if title}}\
      {{title}}\
      {{/if}}\
      {{#if subtitle}}\
        <p class="option-subtitle">{{subtitle}}</p>\
      {{/if}}\
   </a>\
   ');

  var DropDownOption = BaseView.extend({
    tagName: 'li',

    events: {
      click: function (e) {
        e.preventDefault();
        this.action && this.action.call(this);
      }
    },

    constructor: function () {
      BaseView.apply(this, arguments);
      this.$el.addClass('okta-dropdown-option option');
    },

    render: function () {
      this.$el.html(optionsTemplate({
        icon: _.result(this, 'icon'),
        className: _.result(this, 'className') || '',
        title: _.result(this, 'title'),
        subtitle: _.result(this, 'subtitle'),
        seleniumId: _.result(this, 'seleniumId')
      }));
      return this;
    }
  });

  return BaseView.extend({

    events: {
      'click a.option-selected': function (e) {
        e.preventDefault();
        if (_.result(this, 'disabled')) {
          e.stopPropagation();
        }
      },
      'click .dropdown-disabled': function (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    },

    items: [],

    constructor: function () {

      // In this very specific case we want to NOT append className to $el
      // but to the <a> tag in the template
      // so we want to disable backbone default functionality.
      var className = this.className;
      this.className = null;

      BaseView.apply(this, arguments);

      this.className = className;

      this.$el.addClass('dropdown more-actions float-l');

      _.each(_.result(this, 'items'), function (option) {
        this.addOption(option, this.options);
      }, this);

    },

    template: '\
      <a href="#" class="link-button {{className}} link-button-icon option-selected center">\
        {{#if icon}}\
        <span class="icon {{icon}}"></span>\
        {{/if}}\
        <span class="option-selected-text">{{title}}</span>\
        <span class="icon-dm"></span>\
      </a>\
      <div class="options clearfix" style="display: none;">\
      <ul class="okta-dropdown-list options-wrap clearfix"></ul>\
      </div>\
    ',

    getTemplateData: function () {
      var className = [_.result(this, 'className') || '',
        _.result(this, 'disabled') ? 'dropdown-disabled' : ''
      ];
      return {
        icon: _.result(this, 'icon'),
        className: $.trim(className.join(' ')),
        title: _.result(this, 'title')
      };
    },

    addOption: function (proto, options) {
      this.add(DropDownOption.extend(proto), 'ul.options-wrap', {options: options || {}});
    }

  });

});

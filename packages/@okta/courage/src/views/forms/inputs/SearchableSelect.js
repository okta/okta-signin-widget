define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  '../BaseInput',
  'selectize'
],
function (_, TemplateUtil, BaseInput) {

  var footerTpl = TemplateUtil.tpl('\
    <p class="dropdown-footer">{{i18n code="oform.select.dropdown.footer" arguments="num"}}</p>\
  ');

  var emptyFooterTpl = TemplateUtil.tpl('\
    <p class="dropdown-footer">{{i18n code="oform.baseselect.noresults"}}</p>\
  ')();

  return BaseInput.extend({

    template: TemplateUtil.tpl('<select id="{{inputId}}" name="{{name}}"></select>'),
    className: 'o-form-searchable-select',
    maxOptions: 50,

    events: {
      'change select': 'update'
    },

    constructor: function () {
      BaseInput.apply(this, arguments);
      this.selectOptions = this.__getOptions(this.options.options);
    },

    editMode: function () {
      BaseInput.prototype.editMode.apply(this, arguments);

      var value = this.getModelValue(),
          maxOptions = this.getParamOrAttribute('maxOptions'),
          selectOptions = this.selectOptions,
          self = this;

      function handleFooter() {
        self.$('.dropdown-footer').remove();
        _.defer(function () {
          var length = self.$('.selectize-dropdown-content > .option').length;
          if (length === maxOptions) {
            self.$('.selectize-dropdown-content').append(footerTpl({num: maxOptions}));
          }
          else if (length === 0) {
            self.$('.selectize-dropdown-content').append(emptyFooterTpl);
            self.$('.selectize-dropdown.single').show();
          }
        });
      }

      this.$select = this.$('select');

      this.$select.selectize({
        options: selectOptions,
        items: value ? [value] : [],
        placeholder: this.options.placeholder,
        preload: true,
        create: false,
        maxOptions: maxOptions,
        maxItems: 1,
        labelField: 'value',
        valueField: 'key',
        searchField: ['value'],
        onType: handleFooter,
        onDropdownOpen: handleFooter
      });

      return this;
    },

    val: function () {
      return this.$select && this.$select.val();
    },

    focus: function () {
      return this.$select && this.$select.focus();
    },

    __getOptions: function (options) {
      if (_.isFunction(options)) {
        options = options.call(this);
      }
      return _.map(_.isObject(options) ? options : {}, function (value, key) {
        return {key: key, value: value};
      });
    }

  });

});

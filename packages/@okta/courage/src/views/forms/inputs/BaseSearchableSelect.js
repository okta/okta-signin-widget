define([
  'okta/underscore',
  'shared/util/TemplateUtil',
  'shared/util/Util',
  '../BaseInput',
  'selectize'
], function (_, TemplateUtil, Util, BaseInput) {

  var footerTpl = TemplateUtil.tpl('\
    <p class="dropdown-footer">{{i18n code="oform.select.dropdown.footer" bundle="courage" arguments="num"}}</p>\
  ');

  var emptyFooterTpl = TemplateUtil.tpl('\
    <p class="dropdown-footer">{{i18n code="oform.baseselect.noresults" bundle="courage"}}</p>\
  ')();

  return BaseInput.extend({

    getSelectizeOption: Util.constantError('getSelectizeOption is an abstract variable'),

    template: TemplateUtil.tpl('<select id="{{inputId}}" name="{{name}}"></select>'),
    className: 'o-form-searchable-select',
    maxOptions: 50,

    events: {
      'change select': 'update'
    },

    constructor: function () {
      BaseInput.apply(this, arguments);
      if (!_.isObject(this.options.options)) {
        throw new Error('options is not provided when initializes SearchableSelect');
      }
      this.selectOptions = this.__getOptions(this.options.options);
    },

    handleFooter: function () {
      var self = this,
          maxOptions = this.getParamOrAttribute('maxOptions');

      self.$('.dropdown-footer').remove();
      _.defer(function () {
        var length = self.$('.selectize-dropdown-content > .option').length;
        if (length === maxOptions) {
          self.$('.selectize-dropdown-content').append(footerTpl({num: maxOptions}));
        }
        else if (length === 0) {
          self.$('.selectize-dropdown-content').append(emptyFooterTpl);
          self.$('.selectize-dropdown').show();
        }
      });
    },

    editMode: function () {
      BaseInput.prototype.editMode.apply(this, arguments);

      this.$select = this.$('select');

      this.$select.selectize(this.getSelectizeOption());

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

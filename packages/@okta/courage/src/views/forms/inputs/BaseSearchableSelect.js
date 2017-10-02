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
    maxOptions: 150,

    events: {
      'change select': 'update'
    },

    constructor: function () {
      BaseInput.apply(this, arguments);
      if (!_.isObject(this.options.options)) {
        throw new Error('options is not provided when initializes SearchableSelect');
      }
      var opts = this.__getOptions(this.options.options);
      this.selectOptions = opts.options;
      this.optGroups = opts.groups;

      // avoid footer to be added multiple times
      // e.g. `handleFooter` is invoked at both onDropdownOpen and onType
      // which will possiblely cause footer to be added twice.
      this._addFooterNote = _.debounce(this._addFooterNote.bind(this), 100);
    },

    handleFooter: function () {
      this.$('.dropdown-footer').remove();
      this._addFooterNote();
    },

    _addFooterNote: function () {
      var maxOptions = this.getParamOrAttribute('maxOptions');
      var length = this.$('.selectize-dropdown-content .option').length;
      if (length === maxOptions) {
        this.$('.selectize-dropdown-content').append(footerTpl({num: maxOptions}));
      }
      else if (length === 0) {
        this.$('.selectize-dropdown-content').append(emptyFooterTpl);
        this.$('.selectize-dropdown').show();
      }
    },

    getExtraOptions: function () {
      var maxOptions = this.getParamOrAttribute('maxOptions'),
          selectOptions = this.selectOptions,
          optGroups = this.optGroups;

      var baseOptions = {
        options: selectOptions,
        placeholder: this.options.placeholder,
        preload: true,
        maxOptions: maxOptions,
        labelField: 'value',
        valueField: 'key',
        searchField: ['value'],
        onType: this.handleFooter.bind(this),
        optgroups: optGroups,
        optgroupField: 'group'
      };

      return _.extend(baseOptions, this.getSelectizeOption());
    },

    editMode: function () {
      BaseInput.prototype.editMode.apply(this, arguments);

      this.$select = this.$('select');

      this.$select.selectize(this.getExtraOptions());

      return this;
    },

    val: function () {
      return this.$select && this.$select.val();
    },

    focus: function () {
      return this.$select && this.$select.focus();
    },

    getOptionString: function (val) {
      //If options dont have groups
      if (!_.size(this.optGroups) && this.options.options) {
        return this.options.options[val];
      }

      //If options have group then we need to loop through the
      //selectOptions array to find out the value.
      var option = _.find(this.selectOptions, function (obj) {
        return obj.key === val;
      });

      if (option) {
        return option.value;
      }
    },

    __getOptions: function (options) {
      if (_.isFunction(options)) {
        options = options.call(this);
      }

      //Seperate out options and groups
      return _.reduce(_.isObject(options) ? options : {}, function (output, value, key) {
        if (_.isObject(value)) {
          var group = key;
          output.groups.push({value: group, label: group});

          _.reduce(value, function (opt, value, key) {
            opt.push({key: key, value: value, group: group});
            return opt;
          }, output.options);

        } else {
          output.options.push({key: key, value: value});
        }
        return output;
      }, {options: [], groups: []});
    }
  });
});

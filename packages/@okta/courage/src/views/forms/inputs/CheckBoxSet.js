define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/Keys',
  'shared/util/TemplateUtil',
  'shared/views/forms/BaseInput',
  'vendor/plugins/jquery.custominput',
  'vendor/lib/json2'
], function (_, $, Keys, TemplateUtil, BaseInput) {

  var columnTitle = TemplateUtil.tpl('\
    <span class="bold margin-n10">{{title}}</span>\
  ');

  var template = TemplateUtil.tpl('\
    <input type="checkbox" name="{{name}}" id="{{id}}"/>\
    <label for="{{id}}">{{label}}</label>\
  ');

  var checkBoxName = TemplateUtil.tpl('{{suffix}}{{id}}');

  return BaseInput.extend({

    initialize: function (options) {
      this.allOptions = options.options.all;
      this.suffix = options.name;
      // Next lines are for multi column rendering
      this.groupedOptions = {};
      if (options.options.multiColumn) {
        var groupBy = options.options.groupByField;
        _.each(this.allOptions, function (option) {
          if (!this.groupedOptions[option[groupBy]]) {
            this.groupedOptions[option.category] = [];
          }
          this.groupedOptions[option.category].push(option);
        }, this);
      }

    },

    events: {
      'change :checkbox': 'update',
      'keyup': function (e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === Keys.SPACE) {
          $(e.target).click();
        }
      }
    },

    preRender: function () {
      this.$el.empty();
      var columns = _.keys(this.groupedOptions);
      if (this.options.options.multiColumn && columns.length > 1) {
        this.renderMultiColumn(columns);
      } else {
        this.renderSingleColumn();
      }
      var $input = this.$('input');
      _.defer(_.bind($input.customInput, $input));
    },

    renderSingleColumn: function () {
      _.each(this.allOptions, function (checkBox) {
        this.$el.append(template({
          name: checkBoxName(_.extend(this, checkBox)),
          id: checkBoxName(_.extend(this, checkBox)),
          label: checkBox.displayName || checkBox.name
        }));
      }, this);
    },

    renderMultiColumn: function (columns) {
      var className = columns.length == 3 ? 'su-checkbox-3columns' : 'su-checkbox-2columns';
      _.each(columns, function (column, index) {
        var columnId = 'column' + index;
        this.$el.append('<span class="' + className + '" id="' + columnId + '">');
        var $column = this.$el.find('#' + columnId);
        $column.append(columnTitle({title: column}));
        _.each(this.groupedOptions[column], function (checkBox) {
          $column.append(template({
            name: checkBoxName(_.extend(this, checkBox)),
            id: checkBoxName(_.extend(this, checkBox)),
            label: checkBox.displayName || checkBox.name
          }));
        }, this);
        this.$el.append('</span>');
      }, this);
    },

    editMode: function () {
      this.$(':checkbox').prop('checked', false);
      _.each(this.model.get(this.options.name), function (checkBox) {
        this.$('input#' + checkBoxName(_.extend(this, checkBox))).prop('checked', checkBox.enabled);
      }, this);
      this.getModelValue();
      return this;
    },

    val: function () {
      var vals = [];
      _.each(this.allOptions, function (checkBox) {
        checkBox.enabled = this.$(':input#' + checkBoxName(_.extend(this, checkBox))).prop('checked');
        vals.push(checkBox);
      }, this);
      return vals;
    },

    update: function () {
      var value = this.val();
      // change event is not triggered unless we change the whole array
      this.model.set(this.options.name, JSON.parse(JSON.stringify(value)));
    },

    focus: function () {}

  });

});

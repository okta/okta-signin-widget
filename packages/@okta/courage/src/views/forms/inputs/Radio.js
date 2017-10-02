/* eslint max-statements: [2, 12], max-params: [2, 6] */
define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/Keys',
  'shared/util/Util',
  '../BaseInput',
  'shared/views/BaseView',
  'vendor/plugins/jquery.custominput'
], function (_, $, Keys, Util, BaseInput, BaseView) {

  var isABaseView = Util.isABaseView;

  var RadioOption = BaseView.extend({
    template: '\
      <input type="radio" name="{{name}}" data-se-name="{{realName}}" value="{{value}}" id="{{optionId}}">\
      <label for="{{optionId}}" data-se-for-name="{{realName}}" class="radio-label">\
        {{label}}\
      </label>\
    ',
    initialize: function (options) {
      var explain;

      explain = options.explain;
      if (_.isFunction(explain) && !isABaseView(explain)) {
        explain = _.resultCtx(this.options, 'explain', this);
      }
      if (!explain) {
        return;
      }

      if (isABaseView(explain)) {
        this.add('<p class="o-form-explain"></p>', '.radio-label');
        this.add(explain, '.o-form-explain');
      }
      else {
        this.add('<p class="o-form-explain">{{explain}}</p>', '.radio-label');
      }
    }
  });

  return BaseInput.extend({

    /**
    * @Override
    */
    events: {
      'change :radio': 'update',
      'keyup': function (e) {
        if (Keys.isSpaceBar(e)) {
          $(e.target).click();
        }
        else if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
      }
    },

    /**
    * @Override
    */
    editMode: function () {
      var templates = [];
      this.$el.empty();

      _.each(this.options.options, function (value, key) {
        var options = {
          optionId: _.uniqueId('option'),
          name: this.options.inputId,
          realName: this.options.name,
          value: key
        };

        if (!_.isObject(value)) {
          value = { label: value };
        }
        _.extend(options, value);

        templates.push(new RadioOption(options).render().el);
      }, this);
      this.$el.append(templates);
      var value = this.getModelValue();
      if (value) {
        this.$(':radio[value=' + value + ']').prop('checked', true);
      }

      this.$('input').customInput();
      this.model.trigger('form:resize');

      if (this.getParam('inline') === true) {
        this.$('div.custom-radio').addClass('inline');
      }

      return this;
    },

    /**
    * @Override
    */
    readMode: function () {
      this.editMode();
      this.$(':radio').prop('disabled', true);
      return this;
    },

    /**
    * @Override
    */
    val: function () {
      return this.$(':radio:checked').val();
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$('label:eq(0)').focus();
    }

  });

});

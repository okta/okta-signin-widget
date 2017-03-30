define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/Keys',
  'shared/util/TemplateUtil',
  '../BaseInput',
  'vendor/plugins/jquery.custominput'
], function (_, $, Keys, TemplateUtil, BaseInput) {

  var template = TemplateUtil.tpl('\
      <input type="radio" name="{{name}}" data-se-name="{{realName}}" value="{{value}}" id="{{id}}">\
      <label for="{{id}}" data-se-for-name="{{realName}}">\
        {{label}}\
        {{#if explain}}\
        <p class="o-form-explain">{{explain}}</p>\
        {{/if}}\
      </label>\
  ');

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
      this.$el.empty();

      _.each(this.options.options, function (value, key) {
        var options = {
          id: _.uniqueId('option'),
          name: this.options.inputId,
          realName: this.options.name,
          value: key
        };

        if (!_.isObject(value)) {
          value = { label: value };
        }
        _.extend(options, value);

        this.$el.append(template(options));
      }, this);

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

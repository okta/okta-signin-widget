define([
  'okta/underscore',
  'shared/util/Keys',
  'shared/util/TemplateUtil',
  '../BaseInput',
  'vendor/plugins/jquery.custominput'
], function (_, Keys, TemplateUtil, BaseInput) {

  var template = TemplateUtil.tpl('\
    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>\
    <label for="{{inputId}}" data-se-for-name="{{name}}">{{placeholder}}</label>\
  ');

  return BaseInput.extend({
    template: template,
    /**
    * @Override
    */
    events: {
      'change :checkbox': 'update',
      'keyup': function (e) {
        if (Keys.isSpaceBar(e)) {
          this.$(':checkbox').click();
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
      var placeholder = _.resultCtx(this.options, 'placeholder', this);
      if (placeholder === '') {
        placeholder = _.resultCtx(this.options, 'label', this);
      } else if (placeholder === false) {
        placeholder = '';
      }

      this.$el.html(this.template(_.extend(_.omit(this.options, 'placeholder'), { placeholder: placeholder })));
      var $input = this.$(':checkbox');
      $input.prop('checked', this.getModelValue() || false);

      this.$('input').customInput();
      this.model.trigger('form:resize');

      return this;
    },

    /**
     * @Override
    */
    readMode: function () {
      this.editMode();
      this.$(':checkbox').prop('disabled', true);
      return this;
    },

    /**
    * @Override
    */
    val: function () {
      return this.$(':checkbox').prop('checked');
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$(':checkbox').focus();
    }

  });

});

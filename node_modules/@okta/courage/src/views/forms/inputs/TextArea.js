define([
  'shared/util/TemplateUtil',
  '../BaseInput',
  'vendor/plugins/jquery.placeholder'
],
function (TemplateUtil, BaseInput) {

  var EDIT_MODE_CLASSES = 'okta-form-textarea-field textarea-fix o-form-control',
      READ_MODE_CLASSES = 'o-form-pre';

  return BaseInput.extend({
    template: TemplateUtil.tpl('<textarea name="{{name}}" rows="0" cols="0" id="{{inputId}}"\
      placeholder="{{placeholder}}">{{value}}</textarea>'),

    tagName: 'span',

    /**
    * @Override
    */
    events: {
      'input textarea': 'update',
      'change textarea': 'update',
      'propertychange textarea': 'update'
    },

    /**
    * @Override
    */
    editMode: function () {
      this.$el.addClass(EDIT_MODE_CLASSES);
      this.$el.removeClass(READ_MODE_CLASSES);
      BaseInput.prototype.editMode.apply(this, arguments);
      this.$('textarea').placeholder();
      return this;
    },

    /**
    * @Override
    */
    readMode: function () {
      BaseInput.prototype.readMode.apply(this, arguments);
      this.$el.removeClass(EDIT_MODE_CLASSES);
      this.$el.addClass(READ_MODE_CLASSES);
    },

    /**
    * @Override
    */
    val: function () {
      var $el = this.$('textarea:eq(0)');
      return $el.val.apply($el, arguments);
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$('textarea').focus();
    }

  });

});

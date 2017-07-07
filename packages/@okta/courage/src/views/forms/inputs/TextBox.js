define([
  'shared/util/TemplateUtil',
  '../BaseInput',
  'shared/util/Keys',
  'vendor/plugins/jquery.placeholder'
],
function (TemplateUtil, BaseInput, Keys) {

  var className = 'okta-form-input-field input-fix';

  return BaseInput.extend({

    template: TemplateUtil.tpl('<input type="{{type}}" placeholder="{{placeholder}}"\
      name="{{name}}" id="{{inputId}}" value="{{value}}"/>'),

    /**
    * @Override
    */
    events: {
      'input input': 'update',
      'change input': 'update',
      'keydown input': 'update',
      'keyup input': function (e) {
        if (Keys.isEnter(e)) {
          this.model.trigger('form:save');
        }
        else if (Keys.isEsc(e)) {
          this.model.trigger('form:cancel');
        }
      }
    },

    constructor: function () {
      BaseInput.apply(this, arguments);
      this.$el.addClass('o-form-control');
    },

    /**
    * @Override
    */
    editMode: function () {
      this.$el.addClass(className);
      BaseInput.prototype.editMode.apply(this, arguments);
      this.$('input').placeholder();
    },

    /**
    * @Override
    */
    readMode: function () {
      BaseInput.prototype.readMode.apply(this, arguments);
      if (this.options.type == 'password') {
        this.$el.text('********');
      }
      this.$el.removeClass(className);
    },

    /**
    * @Override
    */
    val: function () {
      //IE will only read clear text pw if type="password" is explicitly in selector
      return this.$('input[type="' + this.options.type + '"]').val();
    },

    /**
    * @Override
    */
    focus: function () {
      return this.$('input').focus();
    }

  });

});

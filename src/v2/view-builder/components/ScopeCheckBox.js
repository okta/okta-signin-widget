import { _, internal, loc } from '@okta/courage';
import { doesI18NKeyExist } from 'v2/ion/i18nTransformer';
import hbs from '@okta/handlebars-inline-precompile';

const CheckBox = internal.views.forms.inputs.CheckBox;

export default CheckBox.extend({
  template: hbs`
    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>
    <label for="{{inputId}}" data-se-for-name="{{name}}"><b>{{placeholder}}</b><p>{{desc}}</p></label>
  `,

  getLocalizedLabel: function() {
    const key = `consent.scopes.${this.options.options.scopeName}.label`;
    return doesI18NKeyExist(key) ? loc(key, 'login') : (this.options.placeholder || this.options.options.scopeName);
  },

  getLocalizedDesc: function() {
    const key = `consent.scopes.${this.options.options.scopeName}.desc`;
    return doesI18NKeyExist(key) ? loc(key, 'login') : this.options.options.desc;
  },

  isCustomizedScope: function() {
    return !doesI18NKeyExist(`consent.scopes.${this.options.options.scopeName}.label`);
  },

  /**
   * @Override
   */
  enable: function() {
    if (this.options.options.mutable) {
      this.$(':input').prop('disabled', false);
    }
  },

  /**
   * @Override
   */
  editMode: function() {

    this.$el.html(this.template(_.extend(_.omit(this.options, 'placeholder'), {
      placeholder: this.getLocalizedLabel(),
      desc: this.getLocalizedDesc()
    })));

    this.$(':checkbox').prop('checked', this.getModelValue() || false);

    this.$('input').customInput();
    this.model.trigger('form:resize');


    if (!this.options.options.mutable) {
      const input = this.$('input').get(0);
      this.$(input.parentElement).addClass('o-form-read-mode');
      this.$(':checkbox').prop('disabled', true);
    }

    if (this.options.options.scopeName === 'openid' || this.isCustomizedScope()) {
      this.$('label > b').addClass('no-translate');
      if (this.isCustomizedScope()) {
        this.$('label > p').addClass('no-translate');
      }
    }

    return this;
  },

});
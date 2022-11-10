import { _, internal } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const CheckBox = internal.views.forms.inputs.CheckBox;

export default CheckBox.extend({
  template: hbs`
    <input type="checkbox" name="{{name}}" id="{{inputId}}"/>
    <label for="{{inputId}}" data-se-for-name="{{name}}"><b>{{placeholder}}</b><p>{{desc}}</p></label>
  `,

  /**
     * @Override
     */
  enable: function() {
    if (this.options.options.optional) {
      this.$(':input').prop('disabled', false);
    }
  },

  /**
     * @Override
     */
  editMode: function() {

    this.$el.html(this.template(_.extend(_.omit(this.options, 'placeholder'), {
      placeholder: this.options.placeholder || this.options.name,
      desc: this.options.options.description
    })));

    this.$(':checkbox').prop('checked', this.getModelValue() || false);

    this.$('input').customInput();
    this.model.trigger('form:resize');

    if (!this.options.options.optional) {
      const input = this.$('input').get(0);
      this.$(input.parentElement).addClass('o-form-read-mode');
      this.$(':checkbox').prop('disabled', true);
    }

    if (this.options.name === 'openid' || this.options.options.isCustomized) {
      this.$('label > b').addClass('no-translate');
      if (this.options.options.isCustomized) {
        this.$('label > p').addClass('no-translate');
      }
    }

    return this;
  },

});
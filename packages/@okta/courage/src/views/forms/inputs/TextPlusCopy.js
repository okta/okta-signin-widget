define([
  'shared/util/TemplateUtil',
  'shared/util/Clipboard',
  'shared/views/forms/BaseInput',
  'shared/util/StringUtil',
  'qtip'
],
function (TemplateUtil, Clipboard, BaseInput, StringUtil) {
  /**
   * @class TextPlusCopy
   * A component that shows a disabled input field and a copy-to-clipboard icon.
   * An input for {@link Okta.Form}
   * 
   * Example of how to add this input from BaseForm:
   *
   * ```javascript
   * this.addInput({
   *   name: 'clientSecretLabel',
   *   type: 'text+copy',  // shows text input first, then copy button
   *   label: 'Client Secret',
   *   params: {
   *     copyValue: 'https://example.okta.com'
   *   }
   * });
   * ```
   */

  return BaseInput.extend({
    tagName: 'span',

    template: TemplateUtil.tpl(`
      <span data-se="o-form-input-{{name}}" class="o-form-control
      okta-form-input-field input-fix copy-input-element">
        <input class="disabled-input" type="text" name="{{name}}" id="{{inputId}}"
        value="{{params.copyValue}}">
      </span>
      <a data-clipboard-text="{{params.copyValue}}" class="link-button link-button-icon
      icon-only copy-clipboard-button">
        <span class="o-form-tooltip icon copy-to-clipboard-16" title="{{params.tooltip}}"></span>
      </a>
    `),

    className: 'o-form-input-group',

    events: {
      'click .copy-clipboard-button': function () {
        // When the button is selected, update the tooltip text to say 'Copied!'
        var tooltip = this.$('.o-form-tooltip').qtip('api');
        tooltip.set('content.text', StringUtil.localize('oform.copy_button.after', 'courage'));
      },
      'mouseout .copy-clipboard-button': function () {
        // When moving away from the button, revert the text back to 'Copy to clipboard'
        var tooltip = this.$('.o-form-tooltip').qtip('api');
        tooltip.set('content.text', StringUtil.localize('oform.copy_button.before', 'courage'));
      }
    },

    editMode: function () {
      /**
       * Should not be able to edit the text inside of 'edit mode'
       * 
       * NOTE: We use 'readMode' to emulate the classic input behavior,
       * as 'editMode' and 'readMode' are inverted in this use case.
       */

      BaseInput.prototype.readMode.apply(this, arguments);

      // Set the read-only value to the copyValue text
      this.$el.text(this.options.params.copyValue || '');   
      this.$el.addClass('copy-text-element');
    },

    readMode: function () {
      /**
       * Should be able to copy the input inside of 'read mode'
       * 
       * NOTE: We use 'editMode' here to emulate the classic input behavior,
       * as 'editMode' and 'readMode' are inverted in this use case.
       */      

      BaseInput.prototype.editMode.apply(this, arguments);
      this.$el.removeClass('copy-text-element');
    },

    postRender: function () {
      // Attach each button to the respective 'data-clipboard-text'
      this.clipboard = Clipboard.attach('.copy-clipboard-button');

      // Manually set the input to disabled, since we cannot do it from the template.
      var disabledInput = this.$('.disabled-input');

      // Verify element exists
      if (disabledInput.length > 0 && disabledInput[0]) {
        disabledInput[0].disabled = true;
      }

      // Add tool-tip to icon
      this.$('.o-form-tooltip').qtip({
        content: {
          text: StringUtil.localize('oform.copy_button.before', 'courage')
        },
        style: { classes: 'qtip-custom qtip-shadow' },
        position: {
          my: 'bottom center',
          at: 'center center',
          target: 'mouse'
        },
        hide: { fixed: true },
        show: { delay: 0 }
      });
    }
  });
});

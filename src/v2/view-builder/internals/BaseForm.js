import { _, Form, loc, internal, createCallout } from 'okta';
import FormInputFactory from './FormInputFactory';
import { MESSAGE_CLASS } from '../../ion/RemediationConstants';

const { FormUtil } = internal.views.forms.helpers;

export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,

  title() {
    return loc('oform.title.authenticate', 'login');
  },

  save() {
    return loc('oform.next', 'login');
  },

  modelEvents: {
    'clearFormError': 'handleClearFormError',
    'error': 'triggerAfterError',
  },

  initialize() {
    const uiSchemas = this.getUISchema();
    const inputOptions = uiSchemas.map(FormInputFactory.create);

    //should be used before adding any other input components
    this.showMessages();

    // Render CAPTCHA if one of the form fields requires us to.
    this.listenTo(this.options.appState, 'onCaptchaLoaded', (captchaObject) => {
      this.captchaObject = captchaObject;
    });

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    this.listenTo(this, 'save', this.saveForm);
    this.listenTo(this, 'cancel', this.cancelForm);
  },

  handleClearFormError() {
    if (this.$('.o-form-error-container').hasClass('o-form-has-errors')) {
      this.clearErrors();
    }
  },

  triggerAfterError(model, error) {
    this.options.appState.trigger('afterError', error);
  },

  saveForm(model) {
    //remove any existing warnings or messages before saving form
    this.$el.find('.o-form-error-container').empty();

    // Execute Captcha if enabled for this form.
    if (this.captchaObject) {
      this.captchaObject.execute();
    } else {
      this.options.appState.trigger('saveForm', model);
    }
  },

  cancelForm() {
    this.options.appState.trigger('invokeAction', 'cancel');
  },

  getUISchema() {
    if (Array.isArray(this.options.currentViewState.uiSchema)) {
      return this.options.currentViewState.uiSchema;
    } else {
      return [];
    }
  },

  addInputOrView(input) {
    if (input.visible === false || input.mutable === false) {
      return;
    }
    if (input.View) {
      this.add(input.View, _.omit(input, 'View', 'showWhen'));
      if (input.showWhen) {
        FormUtil.applyShowWhen(this.last(), input.showWhen);
      }
    } else {
      this.addInput(input);
    }

    if (Array.isArray(input.optionsUiSchemas)) {
      if (this.options.optionUiSchemaConfig[input.name]) {
        const optionUiSchemaIndex = Number(this.options.optionUiSchemaConfig[input.name]);
        const optionUiSchemas = input.optionsUiSchemas[optionUiSchemaIndex] || [];
        optionUiSchemas.forEach(this.addInputOrView.bind(this));
      }
    }
  },

  /*
   * Whether an form error message should be rendered as the default BaseForm error banner or not
   * if this function returns true, BaseForm won't render the error banner after form submit. Instead,
   * the form needs to override showCustomErrorCallout with the logic to render that error message
   */
  isErrorCalloutCustomized() {
    return false;
  },

  /*
   * Renders an error message (if any) after form is submitted
   * This should be overriden if isErrorCalloutCustomized() returns true
   */
  showCustomErrorCallout() {
    this.$('.o-form-error-container').addClass('o-form-has-errors');
  },

  /*
   * Renders the contents of messages object (if any) during initialize
   * This function is called during Form.initialize, and will display
   * messages when the form renders.
   * Note: any errors happening after the form is rendered won't use this function,
   * this is only used during initialize
   */
  showMessages() {
    // render messages as text
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs?.value.length) {

      const content = messagesObjs.value
        .filter(messagesObj => {
          const isWarningMessage = messagesObj?.class === MESSAGE_CLASS.WARN;
          if (isWarningMessage) {
            // Display WARN messages in a callout before filtering them out 
            this.add(createCallout({
              content: messagesObj.message,
              type: 'warning',
            }), {
              selector: '.o-form-error-container',
            });
          }
          return !isWarningMessage;
        })
        .map((messagesObj) => {
          return messagesObj.message;
        });

      this.add(`<div class="ion-messages-container">${content.join(' ')}</div>`, '.o-form-error-container');
    }
  },
});

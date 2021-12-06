import { _, Form, loc, internal, createCallout, View } from 'okta';
import FormInputFactory from './FormInputFactory';

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
    const formErrorContainer = this.$('.o-form-error-container');
    formErrorContainer.empty();
    if (formErrorContainer.hasClass('o-form-has-errors')) {
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

  postRender() {
    /**
     * Widget would use infoContainer to display interactive messages that should be persisted during
     * invalid form submissions. For eg resend-warning callout should not be cleared upon invalid form submit.
     * Rerender would clear infoContainer or views classes can clear it explicitly.
     */
    const infoContainer= '<div class=\'o-form-info-container\'></div>';
    this.$el.find('.o-form-error-container').before(infoContainer);

    const { identifier } = this.options.appState.get('user') || {};
    if (identifier) {
      // add identifier below title
      // if no title ('terminal-reset-password-success'), do what?
      this.$el
        .find('[data-se="o-form-head"]')
        .after(
          `<div class="identifier-container"><span class="identifier" data-se="identifier">${identifier}</span></div>`,
        );
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
  * Views should override this function to render custom error callouts for invalid form actions.
  * Should return true when callout is customized
  */
  showCustomFormErrorCallout: null,

  /*
   * Renders the contents of messages object (if any, on error) during initialize
   * This function is called during Form.initialize, and will display
   * messages when the form reloads.
   * Note: Any user action related form errors handled by FormController.showFormErrors
   */
  showMessages(options) {
    const messages = this.options.appState.get('messages') || {};
    const errContainer = '.o-form-error-container';
    if (Array.isArray(messages.value) && !(options instanceof View)) {
      this.add('<div class="ion-messages-container"></div>', errContainer);
      messages.value.forEach(obj => {
        if(!obj?.class || obj.class === 'INFO') {
          // add message as plain text
          this.add(`<p>${obj.message}</p>`, '.ion-messages-container');
        } else {
          // add error callout with custom options
          options = Object.assign(_.pick(obj, 'message', 'class'), options);
          this.add(createCallout({
            content: options.message,
            type: (options.class || '').toLowerCase(),
            title: options.title ? options.title : ''
          }), errContainer);
        }
      });
    } else if (options instanceof View) {
      // if callee is showCustomFormErrorCallout. show custom error views
      this.add(options, errContainer);
    }
  },
});

import { _, $, Form, loc, internal } from 'okta';
import FormInputFactory from './FormInputFactory';

const { FormUtil } = internal.views.forms.helpers;

const HCAPTCHA_URL = 'https://hcaptcha.com/1/api.js?onload=onCaptchaLoaded&render=explicit';
const HCAPTCHA_PRIVACY_URL = 'https://hcaptcha.com/privacy';
const HCAPTCHA_TERMS_URL = 'https://hcaptcha.com/terms';
const RECAPTCHAV2_URL = 'https://www.google.com/recaptcha/api.js?onload=onCaptchaLoaded&render=explicit';



export default Form.extend({

  layout: 'o-form-theme',
  className: 'ion-form',
  hasSavingState: true,
  autoSave: false,
  noCancelButton: true,

  title () {
    return loc('oform.title.authenticate', 'login');
  },

  save () {
    return loc('oform.next', 'login');
  },

  modelEvents: {
    'clearFormError': 'handleClearFormError',
    'error': 'triggerAfterError',
  },

  initialize () {
    const uiSchemas = this.getUISchema();
    const inputOptions = uiSchemas.map(FormInputFactory.create);

    //should be used before adding any other input components
    this.showMessages();

    inputOptions.forEach(input => {
      this.addInputOrView(input);
    });

    // Render CAPTCHA if we need to and if FF CAPTCHA_SUPPORT is enabled
    if (this.options.currentViewState.captcha) {
      this.addCaptcha(this.options.currentViewState.captcha);
    }

    this.listenTo(this, 'save', this.saveForm);
    this.listenTo(this, 'cancel', this.cancelForm);
  },

  handleClearFormError () {
    if (this.$('.o-form-error-container').hasClass('o-form-has-errors')) {
      this.clearErrors();
    }
  },

  triggerAfterError (model, error) {
    this.options.appState.trigger('afterError', error);
  },

  saveForm (model) {
    //remove any existing warnings or messages before saving form
    this.$el.find('.o-form-error-container').empty();
    this.options.appState.trigger('saveForm', model);
  },

  cancelForm () {
    this.options.appState.trigger('invokeAction', 'cancel');
  },

  getUISchema () {
    if (Array.isArray(this.options.currentViewState.uiSchema)) {
      return this.options.currentViewState.uiSchema;
    } else {
      return [];
    }
  },

  addCaptcha (captchaConfig) {
    // eslint-disable-next-line no-unused-vars
    const onCaptchaSolved = (token) => {
      // Set the token in the model and submit the form.
      this.model.set('captchaVerify.token', token);
      this.saveForm(this.model);
    };

    const onCaptchaLoaded = () => {
      // eslint-disable-next-line no-undef
      const captchaObject = captchaConfig.type === 'HCAPTCHA' ? hcaptcha : grecaptcha;
      // eslint-disable-next-line no-undef
      captchaObject.render(this.saveId, {
        sitekey: captchaConfig.siteKey,
        callback: onCaptchaSolved
      });    

      // Render the HCAPTCHA footer - we need to this manually
      if (captchaConfig.type === 'HCAPTCHA') {
        $('body').append(
          `<div class="footer">
            ${loc('captcha.footer.label', 'login', [HCAPTCHA_PRIVACY_URL, HCAPTCHA_TERMS_URL])}
          </div>`
        );
      }
    };

    // Attaching the callback to the window object so that the CAPTCHA script that we dynamically render
    // can have access to it since it won't have access to this view's scope.
    window.onCaptchaLoaded = onCaptchaLoaded;

    if (captchaConfig.type === 'HCAPTCHA') {
      $.getScript(HCAPTCHA_URL);
    } else if (captchaConfig.type === 'RECAPTCHAV2') {
      $.getScript(RECAPTCHAV2_URL);
    }
  },

  addInputOrView (input) {
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

  showMessages () {
    // render messages as text
    const messagesObjs = this.options.appState.get('messages');
    if (messagesObjs?.value.length) {
      const content = messagesObjs.value.map((messagesObj) => {
        return messagesObj.message;
      });
      this.add(`<div class="ion-messages-container">${content.join(' ')}</div>`, '.o-form-error-container');
    }
  },
});

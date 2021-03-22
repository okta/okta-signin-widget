import { _, $, Form, loc, internal } from 'okta';
import FormInputFactory from './FormInputFactory';

const { FormUtil } = internal.views.forms.helpers;

const HCAPTCHA_URL = 'https://hcaptcha.com/1/api.js?onload=onCaptchaLoaded&render=explicit';
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
      this.loadCaptcha(this.options.currentViewState.captcha);
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

  // loadCaptchaRenderScript (script) {
  //   let captchaScript = document.createElement('script');
  //   captchaScript.text = script;
  //   document.body.appendChild(captchaScript);
  // },

  // loadCaptchaCDNUrl (url) {
  //   let captchaScript = document.createElement('script');
  //   captchaScript.src = url;
  //   captchaScript.async = true;
  //   captchaScript.defer = true;
  //   document.body.appendChild(captchaScript);
  // },

  loadCaptcha (captchaInstance) {

    // eslint-disable-next-line no-unused-vars
    const onCaptchaSolved = (token) => {
      // Set the token in the model.
      this.model.set('captchaVerify.token', token);
      this.saveForm(this.model);
    };

    const onCaptchaLoaded = () => {
      // eslint-disable-next-line no-undef
      const captchaObject = captchaInstance.type === 'HCAPTCHA' ? hcaptcha : grecaptcha;
      // eslint-disable-next-line no-undef
      captchaObject.render(this.saveId, {
        sitekey: captchaInstance.siteKey,
        callback: onCaptchaSolved
      });    
    };

    window.onCaptchaLoaded = onCaptchaLoaded;

    if (captchaInstance.type === 'HCAPTCHA') {
      $.getScript(HCAPTCHA_URL);
    } else if (captchaInstance.type === 'RECAPTCHAV2') {
      $.getScript(RECAPTCHAV2_URL);
    }

    // var renderScript = null;
    // var cdnURL = null;
    // if (captchaInstance.type === 'RECAPTCHAV2') {
    //   renderScript = 'function onloadCallback() {\n' +
    //         '                grecaptcha.render(\'this.saveId\', {\n' +
    //         '                   \'sitekey\' : captchaInstance.siteKey,\n' +
    //         '                   \'callback\' : onCaptchaSolved\n' +
    //         '                });\n' +
    //         '            }';
    //   cdnURL = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit';
    // } else if (captchaInstance.type === 'HCAPTCHA') {
    //   renderScript = 'function onloadCallback() {\n' +
    //         '                hcaptcha.render(\'this.saveId\', {\n' +
    //         '                   \'sitekey\' : captchaInstance.siteKey,\n' +
    //         '                   \'callback\' : onCaptchaSolved\n' +
    //         '                });\n' +
    //         '            }';
    //   cdnURL = 'https://hcaptcha.com/1/api.js?onload=onloadCallback&render=explicit';
    // }

    // if (renderScript !== null && cdnURL !== null) {
    //   this.loadCaptchaRenderScript(renderScript);
    //   this.loadCaptchaCDNUrl(cdnURL);
    // }
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

/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { View } from 'okta';
import Enums from 'util/Enums';
import hbs from 'handlebars-inline-precompile';
import { WIDGET_FOOTER_CLASS } from '../../utils/Constants';

const HCAPTCHA_URL = 
  'https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit';
const RECAPTCHAV2_URL = 
  'https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit';

export default View.extend({
  className: 'captcha-view',

  template: hbs`
    {{#if isCaptchaConfigured}}\
      <div id ="captcha-container"
          class="{{class}}"
          data-sitekey="{{sitekey}}"
          data-callback="onCaptchaSolved"
          data-size="invisible">
      </div>
    {{/if}}\
  `,

  getTemplateData: function() {
    const captchaConfig = this.options.appState.get('captcha');

    let className = 'g-recaptcha';
    if (captchaConfig && captchaConfig.type === 'HCAPTCHA') {
      className = 'h-captcha';
    }

    return {
      class: captchaConfig && className,
      sitekey: captchaConfig && captchaConfig.siteKey,
      isCaptchaConfigured: !!captchaConfig
    };
  },

  initialize() {
    if (this.options.appState.get('captcha')) {
      this.captchaConfig = this.options.appState.get('captcha');
      this._addCaptcha();
    }
  },

  // postRender() {
  //   if (this.options.appState.get('captcha')) {
  //     this.captchaConfig = this.options.appState.get('captcha');
  //     this._addCaptcha();
  //   }
  // },

  remove: function(){
    View.prototype.remove.apply(this, arguments);

    // Cleanup global Captcha references
    if (this.captchaConfig.type === 'HCAPTCHA') {
      window.hcaptcha = undefined;
    } else if (this.captchaConfig.type === 'RECAPTCHA_V2') {
      window.grecaptcha = undefined;
    }
  },

  /**
   *  Load the CAPTCHA lib dynamically (either HCAPTCHA or RECAPTCHAV2). Once loaded, trigger an event to inform
   *  the parent form to actually render the CAPTCHA.
  * */   
  _addCaptcha() {
    // Callback invoked when CAPTCHA is solved. We're binding it to this view so that it's easier
    // to unit test.
    this.onCaptchaSolved = (token) => {

      // Set the token in the model
      const fieldName = this.options.name;
      this.model.set(fieldName, token);

      // By the time we reach this callback, the model has already unflattened the field names.
      // We need to ensure that we set the value inside the unflattened model attribute as well if needed.
      const parts = fieldName.split('.');
      if (parts.length > 1) {
        const topLevelAttribute = parts[0];
        const orignalValue = this.model.get(parts[0]) || {};
        const update = this._unflattenAndSetValue(fieldName, token);
        this.model.set(topLevelAttribute,
          Object.assign(orignalValue, update[topLevelAttribute]));
      }

      // Clear form errors before re-validation
      this.model.trigger('clearFormError');

      // if (this.model.isValid()) {
      this.options.appState.trigger('saveForm', this.model); 
      // }
    };

    // Callback when CAPTCHA lib is loaded.
    const onCaptchaLoaded = () => {
      const captchaObject = this.captchaConfig.type === 'HCAPTCHA' ? window.hcaptcha : window.grecaptcha;
      this.model.set(this.options.name, '***');

      captchaObject.render('captcha-container', {
        sitekey: this.captchaConfig.siteKey,
        callback: (token) => {
          // We reset the Captchas using the id(s) that were generated during their rendering.
          captchaObject.reset();
          // const submitButtons = 
          //   document.querySelectorAll(`#${Enums.WIDGET_CONTAINER_ID} .o-form-button-bar .button[type=submit]`);
          // submitButtons.forEach((btn) => {
          //   captchaObject.reset(btn.getAttribute('data-captcha-id'));
          // });
  
          this.onCaptchaSolved(token);
          // Invoke the callback passed in
          // if (onCaptchaSolvedCallback && _.isFunction(onCaptchaSolvedCallback)) {
          //   onCaptchaSolvedCallback(token);
          // }
        }
      });  

      this.options.appState.trigger('onCaptchaLoaded', captchaObject);

      // Render the HCAPTCHA footer - we need to do this manually since the HCAPTCHA lib doesn't do it
      if (this.captchaConfig.type === 'HCAPTCHA') {
        this._addHCaptchaFooter();
      }  
    };

    // Attaching the callback to the window object so that the CAPTCHA script that we dynamically render
    // can have access to it since it won't have access to this view's scope.
    window.OktaSignInWidgetOnCaptchaLoaded = onCaptchaLoaded;
    window.onCaptchaSolved = this.onCaptchaSolved;

    if (this.captchaConfig.type === 'HCAPTCHA') {
      this._loadCaptchaLib(HCAPTCHA_URL);
    } else if (this.captchaConfig.type === 'RECAPTCHA_V2') {
      this._loadCaptchaLib(RECAPTCHAV2_URL);
    }
  },
  
  /**
   *  We dynamically inject <script> tag into our login container because in case the customer is hosting
   *  the SIW, we need to ensure we don't go out of scope when injecting the script.
  * */ 
  _loadCaptchaLib(url) {
    let scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.async = true;
    scriptTag.defer = true;
    document.getElementById(Enums.WIDGET_CONTAINER_ID).appendChild(scriptTag);
  },

  _addHCaptchaFooter() {
    // NOTE: insetAdjacentHTML() is supported in all major browsers: 
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML#browser_compatibility
    const footerContainer = document.getElementsByClassName(WIDGET_FOOTER_CLASS);
    if (footerContainer.length) {
      const template = hbs('<div class="captcha-footer">\
        <span class="footer-text">\
          {{i18n code="hcaptcha.footer.label" bundle="login" \
          $1="<a href=\'https://hcaptcha.com/privacy\' target=\'_blank\'>$1</a>" \
          $2="<a href=\'https://hcaptcha.com/terms\' target=\'_blank\'>$2</a>"}}\
        </span>\
      </div>');

      footerContainer[0].insertAdjacentHTML('beforeend',
        template()
      );
    }
  },

  _unflattenAndSetValue(fieldName, value) {
    const parts = fieldName.split('.');
    const update = {}; // Will contain the end result update
    let pointer = update; // Pointer that we'll use to move 
    let part = parts.shift(); // Pop out first level of the field(s)

    while (part !== undefined) {
      // We check to see if we're at the bottom level and if so set the value. Otherwise
      // keep defining new object to dig deeper.
      pointer[part] = parts.length ? {} : value;
      pointer = pointer[part]; 
      part = parts.shift();
    }
    return update;
  }

});

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

import { View } from '@okta/courage';
import Enums from 'util/Enums';
import Util from 'util/Util';
import hbs from '@okta/handlebars-inline-precompile';
import { WIDGET_FOOTER_CLASS } from '../../utils/Constants';

const OktaSignInWidgetOnCaptchaLoadedCallback = 'OktaSignInWidgetOnCaptchaLoaded';
const OktaSignInWidgetOnCaptchaSolvedCallback = 'OktaSignInWidgetOnCaptchaSolved';

const HCAPTCHA_URL = 'https://hcaptcha.com/1/api.js';
const RECAPTCHAV2_URL = 'https://www.google.com/recaptcha/api.js';

export default View.extend({
  className: 'captcha-view',

  template: hbs`
    {{#if isCaptchaConfigured}}\
      <div id ="captcha-container"
          class="{{className}}"
          data-sitekey="{{siteKey}}"
          data-callback="{{onCaptchaSolvedCallback}}"
          data-size="invisible">
      </div>
    {{/if}}\
  `,

  getTemplateData: function() {
    if (this.captchaConfig) {
      const className = this.captchaConfig.type === 'HCAPTCHA' ? 'h-captcha' : 'g-recaptcha';
      return { 
        siteKey: this.captchaConfig.siteKey,
        isCaptchaConfigured: true,
        onCaptchaSolvedCallback: OktaSignInWidgetOnCaptchaSolvedCallback,
        className, 
      };
    } else {
      return {};
    }
  },

  initialize() {
    if (this.options.appState.get('captcha')) {
      this.captchaConfig = this.options.appState.get('captcha');
      this._addCaptcha();
    }
  },

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
    // Callback invoked when CAPTCHA is solved.
    const onCaptchaSolved = (token) => {
      const captchaObject = this._getCaptchaOject();

      // We reset the Captcha. We need to reset because every time the 
      // Captcha resolves back with a token and say we have a server side error, 
      // if we submit the form again it won't work otherwise. The Captcha 
      // has to be reset for it to work again in that scenario.
      const captchaId = this.$el.find('#captcha-container').attr('data-captcha-id');
      captchaObject.reset(captchaId);

      // Set the token in the model
      const fieldName = this.options.name;
      this.model.set(fieldName, token);

      this.options.appState.trigger('saveForm', this.model); 
    };

    // Callback when CAPTCHA lib is loaded
    const onCaptchaLoaded = () => {
      // This is just a safeguard to ensure we don't bind Captcha to an already bound element.
      // It shouldn't happen in practice.
      if (this.$el.find('#captcha-container').attr('data-captcha-id')) {
        return;
      }

      const captchaObject = this._getCaptchaOject();

      // We set a temporary token for Captcha because this is a required field for the form and is normally set
      // at a later time. In order to prevent client-side validation errors because of this, we have to set a 
      // dummy value. We then overwrite this with the proper token in the onCaptchaSolved callback.
      this.model.set(this.options.name, 'tempToken');

      const captchaId = captchaObject.render('captcha-container', {
        sitekey: this.captchaConfig.siteKey,
        callback: onCaptchaSolved
      });
      
      this.$el.find('#captcha-container').attr('data-captcha-id', captchaId);

      // Let the Baseform know that Captcha is loaded.
      this.options.appState.trigger('onCaptchaLoaded', captchaObject);

      // Render the HCAPTCHA footer - we need to do this manually since the HCAPTCHA lib doesn't do it
      if (this.captchaConfig.type === 'HCAPTCHA') {
        this._addHCaptchaFooter();
      }  
    };

    // Attaching the callback to the window object so that the CAPTCHA script that we dynamically render
    // can have access to it since it won't have access to this view's scope.
    window[OktaSignInWidgetOnCaptchaLoadedCallback] = onCaptchaLoaded;

    // Attaching the Captcha solved callback to the window object because we reference it in our template under
    // the 'data-callback' attribute which the Captcha library uses to invoke the callback.
    window[OktaSignInWidgetOnCaptchaSolvedCallback] = onCaptchaSolved;

    
    if (this.captchaConfig.type === 'HCAPTCHA') {
      this._loadCaptchaLib(this._getCaptchaUrl(HCAPTCHA_URL, 'hcaptcha'));
    } else if (this.captchaConfig.type === 'RECAPTCHA_V2') {
      this._loadCaptchaLib(this._getCaptchaUrl(RECAPTCHAV2_URL, 'recaptcha'));
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

  _getCaptchaOject() {
    const captchaObject = this.captchaConfig.type === 'HCAPTCHA' ? window.hcaptcha : window.grecaptcha;
    return captchaObject;
  },

  /**
   *  Supported params for hCaptcha script:
   *   https://github.com/hCaptcha/hcaptcha-loader#props
   *   (starting from 'apihost')
   *  Supported params for reCAPTCHA script:
   *   https://developers.google.com/recaptcha/docs/display#javascript_resource_apijs_parameters
  * */
  _getCaptchaUrl(defaultBaseUrl, settingsKey) {
    const locale = this.options.settings.get('language');
    const scriptSource = this.options.settings.get(`${settingsKey}.scriptSource`);
    const scriptParams = this.options.settings.get(`${settingsKey}.scriptParams`);

    const baseUrl = scriptSource || defaultBaseUrl;
    const params = {
      ...scriptParams,
      onload: OktaSignInWidgetOnCaptchaLoadedCallback,
      render: 'explicit',
      hl: locale || navigator.language,
    };
    const query = Util.searchParamsToString(params);
    return baseUrl + '?' + query;
  },

});

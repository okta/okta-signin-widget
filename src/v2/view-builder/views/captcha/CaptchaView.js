/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const HCAPTCHA_URL = 
  'https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit';
const RECAPTCHAV2_URL = 
  'https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit';

import { View, loc } from 'okta';
import Enums from 'util/Enums';
import { WIDGET_FOOTER_CLASS } from '../../utils/Constants';

export default View.extend({
  className: 'captcha-view',

  initialize() {
    if (this.options.appState.get('captcha')) {
      this.captchaConfig = this.options.appState.get('captcha');
      this._addCaptcha();
    }
  },

  remove: function(){
    // Cleanup global Captcha references
    if (this.captchaConfig.type === 'HCAPTCHA') {
      window.hcaptcha = undefined;
    } else if (this.captchaConfig.type === 'RECAPTCHA_V2') {
      window.grecaptcha = undefined;
    }

    View.prototype.remove.apply(this, arguments);
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

      // Clear form errors before re-validation
      this.model.trigger('clearFormError');

      if (this.model.isValid()) {
        this.options.appState.trigger('saveForm', this.model); 
      }
    };

    // Callback when CAPTCHA lib is loaded.
    const onCaptchaLoaded = () => {
      this.options.appState.trigger('onCaptchaLoaded', this.captchaConfig, this.onCaptchaSolved);

      // Render the HCAPTCHA footer - we need to do this manually since the HCAPTCHA lib doesn't do it
      if (this.captchaConfig.type === 'HCAPTCHA') {
        this._addHCaptchaFooter();
      }  
    };

    // Attaching the callback to the window object so that the CAPTCHA script that we dynamically render
    // can have access to it since it won't have access to this view's scope.
    window.OktaSignInWidgetOnCaptchaLoaded = onCaptchaLoaded;

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
      footerContainer[0].insertAdjacentHTML('beforeend',
        `<div class="captcha-footer">
            <span class="footer-text">${loc('hcaptcha.footer.label', 'login')}</span>
          </div>`
      );
    }
  }
});

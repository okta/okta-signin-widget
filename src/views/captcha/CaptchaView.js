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

const HCAPTCHA_URL = 'https://hcaptcha.com/1/api.js?onload=onCaptchaLoaded&render=explicit';
const RECAPTCHAV2_URL = 'https://www.google.com/recaptcha/api.js?onload=onCaptchaLoaded&render=explicit';

import { View } from 'okta';
import Enums from 'util/Enums';

export default View.extend({
  className: 'captcha-view',

  initialize() {
    if (this.options.appState.get('captcha')) {
      this._addCaptcha(this.options.appState.get('captcha'));
    }
  },

  /**
   *  Load the CAPTCHA lib dynamically (either HCAPTCHA or RECAPTCHAV2). Once loaded, trigger an event to inform
   *  the parent form to actually render the CAPTCHA.
  * */   
  _addCaptcha(captchaConfig) {

    // Callback invoked when CAPTCHA is solved.
    const onCaptchaSolved = (token) => {
      // eslint-disable-next-line no-undef
      const captchaObject = captchaConfig.type === 'HCAPTCHA' ? hcaptcha : grecaptcha;
      captchaObject.reset();

      // Set the token in the model
      const fieldName = this._getFieldWithCaptchaHint();
      this.model.set(fieldName, token);

      // Clear form errors before re-validation
      this.model.trigger('clearFormError');

      // Client side form validation
      this.model.validate();

      if (this.model.isValid()) {
        // If there are no errors then submit the form.
        this.model.trigger('clearFormError');
        this.options.appState.trigger('saveForm', this.model); 
      }
    };

    // Callback when CAPTCHA lib is loaded.
    const onCaptchaLoaded = () => {
      this.options.appState.trigger('addCaptcha', onCaptchaSolved);
    };

    // Attaching the callback to the window object so that the CAPTCHA script that we dynamically render
    // can have access to it since it won't have access to this view's scope.
    window.onCaptchaLoaded = onCaptchaLoaded;

    if (captchaConfig.type === 'HCAPTCHA') {
      this._loadCaptchaLib(HCAPTCHA_URL);
    } else if (captchaConfig.type === 'RECAPTCHA_V2') {
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

  /**
   *  Parse through the uiSchema to extract the field that has the CAPTCHA hint associated with it
  * */ 
  _getFieldWithCaptchaHint() {
    const uiSchema = this.options.currentViewState.uiSchema || [];
    for (const schema of uiSchema) {
      if (schema.hint === Enums.HINTS.CAPTCHA) {
        return schema.name;
      }
    }
  },
});

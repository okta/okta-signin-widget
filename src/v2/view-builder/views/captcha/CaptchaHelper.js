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

import { _ } from 'okta';
import Enums from 'util/Enums';

/**
 *  Bind the CAPTCHA to the specified form's submit button(s). This will hijack the submit button's normal
 *  event handler and render the CAPTCHA challenge instead. Upon solving it, the specified callback will be
 *  invoked.
 * @param {object} captchaConfig: The CAPTCHA configuration that includes the type and siteKey
 * @param {Form} form: The form that will be rendering the CAPTCHA
 * @param {Function} onCaptchaSolvedCallback: The callback to be invoked once CAPTCHA is solved
* */ 
export function renderCaptcha(captchaConfig, form, onCaptchaSolvedCallback) {
  const captchaObject = captchaConfig.type === 'HCAPTCHA' ? window.hcaptcha : window.grecaptcha;

  // Iterate over all the primary buttons in the form and bind CAPTCHA to them
  _.each(form.$('.o-form-button-bar .button[type=submit]'), (elem) => {
    const captchaId = captchaObject.render(elem, {
      sitekey: captchaConfig.siteKey,
      callback: (token) => {
        // We reset the Captchas using the id(s) that were generated during their rendering.
        const submitButtons = 
          document.querySelectorAll(`#${Enums.WIDGET_CONTAINER_ID} .o-form-button-bar .button[type=submit]`);
        submitButtons.forEach((btn) => {
          captchaObject.reset(btn.getAttribute('data-captcha-id'));
        });

        // Invoke the callback passed in
        if (onCaptchaSolvedCallback && _.isFunction(onCaptchaSolvedCallback)) {
          onCaptchaSolvedCallback(token);
        }
      }
    });  
    
    // We attach the captchaId to the elem itself so that later on we can use it 
    // to reset the Captcha when needed. We need to reset because every time the 
    // Captcha resolves back with a token and say we have a server side error, 
    // if we click the submit button again it won't work otherwise. The Captcha 
    // has be reset for it to work.
    elem.setAttribute('data-captcha-id', captchaId);
  });
 
}



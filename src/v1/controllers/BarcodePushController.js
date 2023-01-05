/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { loc } from '@okta/courage';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import BarcodeView from 'v1/views/enroll-factors/BarcodeView';
import Footer from 'v1/views/enroll-factors/Footer';
const PUSH_INTERVAL = 6000;

// Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
// in network connection lost errors in Safari and IE.

export default FormController.extend({
  className: 'barcode-push',
  Model: function() {
    return {
      local: {
        __factorType__: ['string', false, this.options.factorType],
        __provider__: ['string', false, this.options.provider],
      },
    };
  },

  Form: {
    title: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

      return loc('enroll.totp.title', 'login', [factorName]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'step-scan' },
    className: 'barcode-scan',
    initialize: function() {
      this.listenTo(this.model, 'error errors:clear', function() {
        this.clearErrors();
      });
    },

    formChildren: [FormType.View({ View: BarcodeView })],
  },

  Footer: Footer,

  initialize: function() {
    this.pollForEnrollment().catch(()=>{
      // Ignoring the errors for now. 
      // clean up will be done based on OKTA-324849
    });
  },

  pollForEnrollment: function() {
    return this.model.doTransaction(function(transaction) {
      return transaction.poll(PUSH_INTERVAL);
    });
  },

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      return true;
    }
  },
});

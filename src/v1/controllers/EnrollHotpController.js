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
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Footer from 'v1/views/enroll-factors/Footer';
import HtmlErrorMessageView from 'v1/views/mfa-verify/HtmlErrorMessageView';
export default FormController.extend({
  className: 'enroll-hotp',
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
      const factors = this.options.appState.get('factors');
      const hotpFactor = factors.findWhere({
        provider: this.model.get('__provider__'),
        factorType: this.model.get('__factorType__'),
      });
      return loc('enroll.totp.title', 'login', [hotpFactor.get('factorLabel')]);
    },
    noButtonBar: true,
    attributes: { 'data-se': 'restrict-enroll' },

    formChildren: function() {
      const children = [
        FormType.View({
          View: new HtmlErrorMessageView({ message: loc('enroll.hotp.restricted', 'login') }),
        }),
      ];

      return children;
    },
  },

  Footer: Footer,
});

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

import { _, loc } from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Footer from 'v1/views/enroll-factors/Footer';
import TextBox from 'v1/views/shared/TextBox';
export default FormController.extend({
  className: 'enroll-yubikey',
  Model: {
    props: {
      passCode: ['string', true],
      factorId: 'string',
    },
    save: function() {
      return this.doTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'token:hardware',
          provider: 'YUBICO',
        });

        return factor.enroll({
          passCode: this.get('passCode'),
        });
      });
    },
  },

  Form: {
    title: _.partial(loc, 'enroll.yubikey.title', 'login'),
    subtitle: _.partial(loc, 'enroll.yubikey.subtitle', 'login'),
    noCancelButton: true,
    save: _.partial(loc, 'mfa.challenge.verify', 'login'),
    autoSave: true,
    className: 'enroll-yubikey',
    formChildren: [
      FormType.View({
        View: '<div class="yubikey-demo" data-type="yubikey-example"></div>',
      }),
      FormType.Input({
        name: 'passCode',
        input: TextBox,
        type: 'password',
      }),
    ],
  },

  Footer: Footer,
});

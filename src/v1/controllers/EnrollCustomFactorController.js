/*!
 * Copyright (c) 2018-2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, loc, internal } from '@okta/courage';
import FormController from 'v1/util/FormController';
import Footer from 'v1/views/enroll-factors/Footer';
const { Util } = internal.util;
export default FormController.extend({
  className: 'enroll-custom-factor',
  Model: {
    local: {
      provider: 'string',
      factorType: 'string',
    },
    save: function() {
      return this.manageTransaction((transaction, setTransaction) => {
        const factor = _.findWhere(transaction.factors, {
          provider: this.get('provider'),
          factorType: this.get('factorType'),
        });

        return factor
          .enroll()
          .then(trans => {
            setTransaction(trans);
            const url = this.appState.get('enrollCustomFactorRedirectUrl');

            if (url !== null) {
              Util.redirect(url);
            }
          })
          .catch(function(err) {
            throw err;
          });
      });
    },
  },

  Form: function() {
    const factors = this.options.appState.get('factors');
    const factor = factors.findWhere({
      provider: this.options.provider,
      factorType: this.options.factorType,
    });
    const vendorName = factor.get('vendorName');
    const subtitle = loc('enroll.customFactor.subtitle', 'login', [vendorName]);
    const saveText = loc('enroll.customFactor.save', 'login');

    return {
      autoSave: true,
      title: vendorName,
      subtitle: subtitle,
      save: saveText,
    };
  },

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      return true;
    }
  },

  initialize: function() {
    this.model.set('provider', this.options.provider);
    this.model.set('factorType', this.options.factorType);
  },

  Footer: Footer,
});

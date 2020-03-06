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

define([
  'okta',
  'util/FormController',
  'views/enroll-factors/Footer'
],
function (Okta, FormController, Footer) {

  var _ = Okta._;
  var { Util } = Okta.internal.util;

  return FormController.extend({
    className: 'enroll-custom-factor',
    Model: {
      local: {
        provider: 'string',
        factorType: 'string'
      },
      save: function () {
        return this.manageTransaction((transaction, setTransaction) => {
          var factor = _.findWhere(transaction.factors, {
            provider: this.get('provider'),
            factorType: this.get('factorType')
          });
          return factor.enroll()
            .then((trans) => {
              setTransaction(trans);
              var url = this.appState.get('enrollCustomFactorRedirectUrl');
              if(url !== null) {
                Util.redirect(url);
              }
            })
            .catch(function (err) {
              throw err;
            });
        });
      }
    },

    Form: function () {
      var factors = this.options.appState.get('factors');
      var factor = factors.findWhere({
        provider: this.options.provider,
        factorType: this.options.factorType
      });
      var vendorName = factor.get('vendorName');
      var subtitle = Okta.loc('enroll.customFactor.subtitle', 'login', [vendorName]);
      var saveText = Okta.loc('enroll.customFactor.save', 'login');
      return {
        autoSave: true,
        title: vendorName,
        subtitle: subtitle,
        save: saveText,
      };
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaEnrollActivate')) {
        return true;
      }
    },

    initialize: function () {
      this.model.set('provider', this.options.provider);
      this.model.set('factorType', this.options.factorType);
    },

    Footer: Footer

  });

});

/*!
 * Copyright (c) 2015-2017, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'views/primary-auth/PrimaryAuthForm'
], function (Okta, PrimaryAuthForm) {

  var _ = Okta._;

  return PrimaryAuthForm.extend({
    className: 'idp-discovery-form',
    save: function () {
      return Okta.loc('oform.next', 'login');
    },
    saveId: 'idp-discovery-submit',

    initialize: function () {
      this.listenTo(this, 'save', _.bind(this.model.save, this.model));
      this.stateEnableChange();
    },

    inputs: function () {
      var inputs = [];
      var usernameProps = {
        inputId: 'idp-discovery-username',
        placeholder: Okta.loc('idpDiscovery.email.placeholder', 'login'),
        disabled: false,
        params: {
          icon: 'person-16-gray'
        }
      };
      inputs.push(_.extend(this.getUsernameField(), usernameProps));
      if (this.settings.get('features.rememberMe')) {
        inputs.push(this.getRemeberMeCheckbox());
      }
      return inputs;
    },

    focus: function () {
      if (!this.model.get('username')) {
        this.getInputs().first().focus();
      }
      else if(this.getInputs().toArray()[1]) {
        this.getInputs().toArray()[1].focus();
      }
    }

  });

});

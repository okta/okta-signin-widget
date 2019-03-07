/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'models/EnrollUser',
  'util/BaseLoginController',
  'views/enrollUser/EnrollUserForm',
  'views/shared/FooterWithBackLink',
],
function (
  Okta,
  EnrollUser,
  BaseLoginController,
  EnrollUserForm,
  FooterWithBackLink,
) {
  var _ = Okta._;
  return BaseLoginController.extend({
    className: 'enroll-user',
    initialize: function (options) {
      this.options = options || {};
      // create model
      this.model = new EnrollUser(this.options);
      // If user is unauthenticated and starts enroll flow make a post call to transition state to PROFILE_REQUIRED
      if (this.options.appState.get('isUnauthenticated')) {
        this.model.getEnrollFormData()
          .then(_.bind(function (response) {
            if (response && response.data) {
              this.options.appState.setAuthResponse(response.data);
              //this.options.appState.set('lastAuthResponse', response.data);
              this.model.set('createNewAccount',
                !!this.options.appState.get('policy').registration.createNewAccount);
              this.renderForm();
            }
          },this));
      } else {
        this.renderForm();
      }
    },
    renderForm: function () {
      var form = new EnrollUserForm(this.toJSON());
      this.add(form);
      this.add(new FooterWithBackLink(this.toJSON()));
      this.addListeners();
    }
  });
});

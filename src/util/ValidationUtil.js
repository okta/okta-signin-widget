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

define(['okta'], function (Okta) {

  var fn = {};

  // Validate the 'username' field on the model.
  fn.validateUsername = function (model) {
    var username = model.get('username');
    if (username && username.length > 256) {
      return {
        username: Okta.loc('model.validation.field.username', 'login')
      };
    }
  };

  // Validate that the 'newPassword' and 'confirmPassword' fields on the model are a match.
  fn.validatePasswordMatch = function (model) {
    if (model.get('newPassword') !== model.get('confirmPassword')) {
      return {
        confirmPassword: Okta.loc('password.error.match', 'login')
      };
    }
  };

  return fn;

});

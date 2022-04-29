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
import EnrollUser from 'v1/models/EnrollUser';
import BaseLoginController from 'v1/util/BaseLoginController';
import EnrollUserForm from 'v1/views/enrollUser/EnrollUserForm';
import FooterWithBackLink from 'v1/views/shared/FooterWithBackLink';
export default BaseLoginController.extend({
  className: 'enroll-user',
  initialize: function(options) {
    this.options = options || {};
    // create model
    this.model = new EnrollUser(this.options);
  },
  fetchInitialData: function() {
    // If user is unauthenticated and starts enroll flow make a post call to transition state to PROFILE_REQUIRED
    if (this.options.appState.get('isUnauthenticated')) {
      return this.model.getEnrollFormData();
    } else {
      return BaseLoginController.prototype.fetchInitialData.call();
    }
  },
  trapAuthResponse: function() {
    if (this.options.appState.get('isProfileRequired')) {
      return true;
    }
  },
  postRender: function() {
    const form = new EnrollUserForm(this.toJSON());

    this.add(form);
    this.add(new FooterWithBackLink(this.toJSON()));
    this.addListeners();
  },
});

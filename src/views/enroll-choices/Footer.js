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

import hbs from 'handlebars-inline-precompile';

define(['okta'], function (Okta) {

  return Okta.View.extend({
    template: hbs`
      <a href="#" class="link goto js-skip" data-se="skip-link">
        {{i18n code="enroll.choices.setup.skip" bundle="login"}}
      </a>
    `,
    className: 'auth-footer clearfix',
    events: {
      'click .js-skip' : function (e) {
        e.preventDefault();
        this.model.doTransaction(function (transaction) {
          return transaction.skip();
        });
      }
    }
  });

});

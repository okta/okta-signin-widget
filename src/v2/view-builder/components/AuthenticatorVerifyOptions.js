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
import { ListView } from 'okta';
import AuthenticatorRow from './views/AuthenticatorRow';

export default ListView.extend({

  className: 'authenticator-verify-list authenticator-list',

  item: AuthenticatorRow,

  itemSelector: '.list-content',

  initialize: function () {
    this.listenTo(this.collection,'selectAutheticator', function (data) {
      this.model.set(this.options.name, data);
      this.options.appState.trigger('saveForm', this.model);
    });
  },

  template: '<div class="list-content"> </div>',

});

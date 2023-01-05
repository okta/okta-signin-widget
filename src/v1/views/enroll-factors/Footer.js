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

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
export default View.extend({
  template: hbs(
    '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="mfa.backToFactors" bundle="login"}}\
      </a>\
    '
  ),
  className: 'auth-footer',
  events: {
    'click .js-back': function(e) {
      e.preventDefault();
      this.options.appState.trigger('backToFactors');
      this.back();
    },
  },

  back: function() {
    this.state.set('navigateDir', Enums.DIRECTION_BACK);
    if (this.options.appState.get('prevLink')) {
      // Once we are in the MFA_ENROLL_ACTIVATE, we need to reset to the
      // correct state. Fortunately, this means that the router will
      // handle navigation once the request is finished.
      this.model.doTransaction(function(transaction) {
        return transaction.prev();
      });
    } else {
      this.options.appState.trigger('navigate', 'signin/enroll');
    }
  },
});

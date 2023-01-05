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

import { _, View, loc, internal } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
const { Util } = internal.util;
export default View.extend({
  template: hbs(
    '\
      <a href="#" class="link {{linkClassName}}" data-se="signout-link">\
        {{linkText}}\
      </a>\
    '
  ),
  className: 'auth-footer clearfix',
  events: {
    'click a[data-se="signout-link"]': 'handleSignout',
  },
  handleSignout: function(e) {
    e.preventDefault();

    const appState = this.options.appState;
    appState.trigger('signOut');
    const isSMSPasswordRecovery = appState.get('isSMSPasswordRecovery');

    this.model
      .doTransaction(function(transaction) {
        // `clearTransactionData` was added as a temporary fix for the issue reported in OKTA-487220
        // OKTA-515889 was created to address the underlying issue on the `transaction.cancel` level
        // and this temporary fix will be removed after that ticket is done
        return transaction.cancel().then(clearTransactionData);
      })
      .then(() => {
        if (this.settings.get('backToSignInUri') && !isSMSPasswordRecovery) {
          Util.redirect(this.settings.get('backToSignInUri'));
        } else {
          this.state.set('navigateDir', Enums.DIRECTION_BACK);
          appState.trigger('navigate', '');
        }
      });
  },
  getTemplateData: function() {
    return {
      linkClassName: _.isUndefined(this.options.linkClassName) ? 'goto' : this.options.linkClassName,
      linkText: this.options.linkText || loc('goback', 'login'),
    };
  },
});

// TODO: remove after OKTA-515889 is done
function clearTransactionData(transaction) {
  return { ...transaction, data: null };
}

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

import { _, View, loc, internal } from 'okta';
import hbs from 'handlebars-inline-precompile';
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
    this.options.appState.trigger('signOut');
    const self = this;

    this.model
      .doTransaction(function(transaction) {
        return transaction.cancel();
      })
      .then(function() {
        if (this.options.closeSession) {
          const authClient = self.options.appState.settings.authClient;
          return authClient.closeSession();
        }
      })
      .then(function() {
        if (self.settings.get('signOutLink')) {
          Util.redirect(self.settings.get('signOutLink'));
        } else {
          self.state.set('navigateDir', Enums.DIRECTION_BACK);
          self.options.appState.trigger('navigate', '');
        }
      });
  },
  getTemplateData: function() {
    return {
      linkClassName: _.isUndefined(this.options.linkClassName) ? '' : this.options.linkClassName,
      linkText: this.options.linkText || loc('goback', 'login'),
    };
  },
});

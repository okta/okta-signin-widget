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

import { _, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import RouterUtil from 'v1/util/RouterUtil';

function goToFactorActivation(appState) {
  const url = RouterUtil.createActivateFactorUrl(
    appState.get('activatedFactorProvider'),
    appState.get('activatedFactorType')
  );

  appState.trigger('navigate', url);
}

export default View.extend({
  template: hbs(
    '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="mfa.backToFactors" bundle="login"}}\
      </a>\
      <a href="#" class="link help goto js-goto" data-se="goto-link">\
        {{i18n code="mfa.scanBarcode" bundle="login"}}\
      </a>\
    '
  ),
  className: 'auth-footer',
  events: {
    'click .js-back': function(e) {
      e.preventDefault();
      this.back();
    },
    'click .js-goto': function(e) {
      e.preventDefault();

      const goToFactor = _.partial(goToFactorActivation, this.options.appState);

      this.options.appState.unset('factorActivationType');
      this.model
        .doTransaction(function(transaction) {
          return transaction.prev().then(function(trans) {
            const factor = _.findWhere(trans.factors, {
              factorType: 'push',
              provider: 'OKTA',
            });

            return factor.enroll();
          });
        })
        .then(goToFactor);
    },
  },
  back: function() {
    const self = this;

    self.options.appState.unset('factorActivationType');
    if (self.options.appState.get('prevLink')) {
      this.model
        .doTransaction(function(transaction) {
          return transaction.prev();
        })
        .then(function() {
          // we trap 'MFA_ENROLL' response that's why we need to trigger navigation from here
          self.options.appState.trigger('navigate', 'signin/enroll');
        });
    } else {
      self.options.appState.trigger('navigate', 'signin/enroll');
    }
  },
});

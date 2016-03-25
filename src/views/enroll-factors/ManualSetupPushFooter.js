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

define(['okta', 'util/RouterUtil'], function (Okta, RouterUtil) {

  var _ = Okta._;

  function goToFactorActivation(appState) {
    var url = RouterUtil.createActivateFactorUrl(appState.get('activatedFactorProvider'),
      appState.get('activatedFactorType'));
    appState.trigger('navigate', url);
  }

  return Okta.View.extend({
    template: '\
      <a href="#" class="link help js-back" data-se="back-link">\
        {{i18n code="mfa.backToFactors" bundle="login"}}\
      </a>\
      <a href="#" class="link help goto js-goto" data-se="goto-link">\
        {{i18n code="mfa.scanBarcode" bundle="login"}}\
      </a>\
    ',
    className: 'auth-footer',
    events: {
      'click .js-back' : function (e) {
        e.preventDefault();
        this.back();
      },
      'click .js-goto' : function (e) {
        e.preventDefault();
        var goToFactor = _.partial(goToFactorActivation, this.options.appState);
        this.options.appState.unset('factorActivationType');
        if (this.options.appState.get('activatedFactorType') !== 'push') {
          this.model.doTransaction(function (transaction) {
            return transaction.prev()
            .then(function (trans) {
              var factor = _.findWhere(trans.factors, {
                factorType: 'push',
                provider: 'OKTA'
              });
              return factor.enroll();
            });
          })
          .then(goToFactor);
        } else {
          this.model.startTransaction(function (authClient) {
            return authClient.tx.resume();
          })
          .then(function() {
            // Sets to trigger on a tick after the appState has been set.
            // This is due to calling the globalSuccessFn in a callback
            setTimeout(goToFactor);
          });
        }
      }
    },
    back: function () {
      var self = this;
      self.options.appState.unset('factorActivationType');
      if (self.options.appState.get('prevLink')) {
        this.model.doTransaction(function(transaction) {
          return transaction.prev();
        })
        .then(function() {
          // we trap 'MFA_ENROLL' response that's why we need to trigger navigation from here
          self.options.appState.trigger('navigate', 'signin/enroll');
        });
      }
      else {
        self.options.appState.trigger('navigate', 'signin/enroll');
      }
    }
  });

});

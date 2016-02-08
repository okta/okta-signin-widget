/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
        var authClient = this.settings.getAuthClient();
        var goToFactor = _.partial(goToFactorActivation, this.options.appState);
        this.options.appState.unset('factorActivationType');
        if (this.options.appState.get('activatedFactorType') !== 'push') {
          authClient.previous()
          .then(function () {
            return authClient.current
              .getFactorByTypeAndProvider('push', 'OKTA')
              .enrollFactor();
          })
          .then(goToFactor)
          .fail(_.bind(function (err) {
            this.model.trigger('error', this.model, err.xhr);
          }, this));
        } else {
          authClient.refreshAuthState()
          .then(function(res) {
            // Sets to trigger on a tick after the appState has been set.
            // This is due to calling the globalSuccessFn in a callback
            setTimeout(function() {
              goToFactor(res);
            });
          })
          .fail(_.bind(function (err) {
            this.model.trigger('error', this.model, err.xhr);
          }, this));
        }
      }
    },
    back: function () {
      this.options.appState.unset('factorActivationType');
      if (this.options.appState.get('prevLink')) {
        this.settings.getAuthClient().current.previous()
        .then(_.bind(function () {
          // we trap 'MFA_ENROLL' response that's why we need to trigger navigation from here
          this.options.appState.trigger('navigate', 'signin/enroll');
        }, this))
        .fail(_.bind(function (err) {
          this.model.trigger('error', this.model, err.xhr);
        }, this));
      }
      else {
        this.options.appState.trigger('navigate', 'signin/enroll');
      }
    }
  });

});

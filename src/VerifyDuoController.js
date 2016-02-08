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

/*jshint camelcase:false, newcap:false */
define([
  'okta',
  'duo',
  'vendor/lib/q',
  'util/FormController',
  'util/Enums',
  'util/FormType',
  'views/shared/FooterSignout'
],
function (Okta, Duo, Q, FormController, Enums, FormType, FooterSignout) {

  var $ = Okta.$,
      _ = Okta._;

  return FormController.extend({

    className: 'mfa-verify-duo duo-form',

    Model: {
      props: {
        host: 'string',
        signature: 'string',
        postAction: 'string',
        factorId: 'string',
        stateToken: 'string'
      },

      getInitOptions: function (appState) {
        // Note: This should all be handled by OktaAuth.js. Currently, we cannot
        // do this because polling is coupled with verify. We should not know
        // about the stateToken!!
        var authClient = this.settings.getAuthClient(),
            factors = appState.get('factors'),
            factor = factors.findWhere({ provider: 'DUO', factorType: 'web' }),
            url = factor.get('_links').verify.href,
            stateToken = appState.get('lastAuthResponse').stateToken;
        return authClient.post(url, { stateToken: stateToken });
      },

      verify: function (signedResponse) {
        // Note: We should be doing this in OktaAuth! Fix when it's updated.
        var url = this.get('postAction'),
            factorId = this.get('factorId'),
            self = this,
            data = {
              id: factorId,
              stateToken: this.get('stateToken'),
              sig_response: signedResponse
            };
        return Q($.post(url, data))
        .then(function () {
          var authClient = self.settings.getAuthClient();
          return authClient.current.startVerifyFactorPoll();
        })
        .fail(function (err) {
          self.trigger('error', self, err.xhr);
        });
      }
    },

    Form: {
      autoSave: true,
      noButtonBar: true,
      title: Okta.loc('factor.duo'),
      attributes: { 'data-se': 'factor-duo' },

      postRender: function () {
        this.add('<iframe frameborder="0"></iframe>');
        Duo.init({
          'host': this.model.get('host'),
          'sig_request': this.model.get('signature'),
          'iframe': this.$('iframe').get(0),
          'post_action': _.bind(this.model.verify, this.model)
        });
      }
    },

    Footer: FooterSignout,

    fetchInitialData: function () {
      var self = this;
      return this.model.getInitOptions(this.options.appState)
      .then(function (res) {
        if (!res._embedded || !res._embedded.factor || !res._embedded.factor._embedded ||
            !res._embedded.factor._embedded.verification) {
          throw new Error('Response does not have duo verification options');
        }
        var verification = res._embedded.factor._embedded.verification;
        self.model.set({
          host: verification.host,
          signature: verification.signature,
          postAction: verification._links.complete.href,
          factorId: res._embedded.factor.id,
          stateToken: res.stateToken
        });
      });
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaChallenge')) {
        return true;
      }
    }

  });

});

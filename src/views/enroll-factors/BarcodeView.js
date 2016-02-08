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

define([
  'okta',
  'util/FactorUtil',
  'util/RouterUtil'
], function (Okta, FactorUtil, RouterUtil) {

  var _ = Okta._;

  return Okta.View.extend({
    className: 'scan-instructions clearfix',
    template: '\
      <div class="scan-instructions-details-wrapper">\
          <div class="scan-instructions-details">\
              <p>{{instructions}}</p>\
          </div>\
      </div>\
      <div class="scan-instructions-qrcode-wrapper">\
          <div class="qrcode-wrap">\
              <img data-se="qrcode" class="qrcode-image" src="{{qrcode}}">\
              <div data-se="qrcode-success" class="qrcode-success"></div>\
              <div data-se="qrcode-error" class="qrcode-error"></div>\
          </div>\
          <a href="#" data-type="manual-setup" data-se="manual-setup" class="link manual-setup">\
            {{i18n code="enroll.totp.cannotScan" bundle="login"}}\
          </a>\
          <a href="#" data-type="refresh-qrcode" data-se="refresh-qrcode" class="link refresh-qrcode">\
            {{i18n code="enroll.totp.refreshBarcode" bundle="login"}}\
          </a>\
      </div>\
    ',

    events: {
      'click [data-type="manual-setup"]': function (e) {
        e.preventDefault();
        var url = RouterUtil.createActivateFactorUrl(this.model.get('__provider__'),
          this.model.get('__factorType__'), 'manual');
        var authClient = this.settings.getAuthClient().current;
        // Check if the stopEnrollFactorPoll is on the authClient, since we don't poll for totp.
        if (authClient.stopEnrollFactorPoll) {
          authClient.stopEnrollFactorPoll();
        }
        this.options.appState.trigger('navigate', url);
      },
      'click [data-type="refresh-qrcode"]': function (e) {
        e.preventDefault();
        this.model.trigger('errors:clear');

        var authClient = this.settings.getAuthClient();
        var promise;

        if (this.options.appState.get('isWaitingForActivation')) {
          promise = authClient.current
          .startEnrollFactorPoll();

        } else {
          promise = authClient.current
          .activateFactor()
          .then(_.bind(function (res) {
            if (res.status === 'MFA_ENROLL_ACTIVATE' && res.factorResult === 'WAITING') {
              // defer the render here to have a lastResponse set in AppState
              // so that we get new QRcode rendered
              _.defer(_.bind(this.render, this));
            }
          }, this));
        }

        promise.fail(_.bind(function (err) {
          this.model.trigger('error', this.model, err.xhr);
        }, this));
      }
    },

    initialize: function () {
      this.listenTo(this.options.appState, 'change:lastAuthResponse', function () {
        if (this.options.appState.get('isMfaEnrollActivate')) {
          this.$el.toggleClass('qrcode-expired', !this.options.appState.get('isWaitingForActivation'));
        } else if (this.options.appState.get('isSuccessResponse')) {
          this.$el.addClass('qrcode-success');
        }
      });
      this.listenTo(this.model, 'error', function () {
        if (this.options.appState.get('isMfaEnrollActivate')) {
          this.$el.toggleClass('qrcode-expired', true);
        }
      });
    },

    getTemplateData: function () {
      var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
      var instructions;
      if (this.model.get('__provider__') === 'GOOGLE') {
        instructions = Okta.loc('enroll.totp.setupGoogleAuthApp', 'login', [factorName]);
      } else {
        instructions = Okta.loc('enroll.totp.setupApp', 'login', [factorName]);
      }
      return {
        instructions: instructions,
        qrcode: this.options.appState.get('qrcode')
      };
    }
  });

});

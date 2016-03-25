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
        this.options.appState.trigger('navigate', url);
      },
      'click [data-type="refresh-qrcode"]': function (e) {
        e.preventDefault();
        this.model.trigger('errors:clear');

        var self = this;
        this.model.doTransaction(function (transaction) {
          if (this.appState.get('isWaitingForActivation')) {
            return transaction.poll();
          } else {
            return transaction.activate();
          }
        })
        .then(function (trans) {
          var res = trans.data;
          if (res.status === 'MFA_ENROLL_ACTIVATE' && res.factorResult === 'WAITING') {
            // defer the render here to have a lastResponse set in AppState
            // so that we get new QRcode rendered
            _.defer(_.bind(self.render, self));
          }
        });
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

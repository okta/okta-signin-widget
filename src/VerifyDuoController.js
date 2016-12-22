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

/*jshint camelcase:false, newcap:false */
define([
  'okta',
  'duo',
  'vendor/lib/q',
  'util/FactorUtil',
  'util/FormController',
  'util/Enums',
  'util/FormType',
  'views/shared/FooterSignout'
],
function (Okta, Duo, Q, FactorUtil, FormController, Enums, FormType, FooterSignout) {

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
        stateToken: 'string',
        rememberDevice: 'boolean'
      },

      initialize: function () {
        var rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);
        // set the initial value for remember device (Cannot do this while defining the
        // local property because this.settings would not be initialized there yet).
        this.set('rememberDevice', rememberDevice);
      },

      getInitOptions: function () {
        var rememberDevice = !!this.get('rememberDevice');
        return this.doTransaction(function(transaction) {
          var data = {
            rememberDevice: rememberDevice
          };
          var factor = _.findWhere(transaction.factors, {
            provider: 'DUO',
            factorType: 'web'
          });
          return factor.verify(data)
          .fail(function (err) {
            // Clean up the cookie on failure.
            throw err;
          });
        });
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
        // We don't actually use authClient.post() here (unlike all the other cases in the
        // sign-in widget) since the endpoint is wired to accept serialized form post instead
        // of a JSON post ($.post() is different from authClient.post() in that in $.post(),
        // jquery decides the Content-Type instead of it being a JSON type). Enroll/Verify DUO
        // are the only two places where we actually do this.
        // NOTE - If we ever decide to change this, we should test this very carefully.
        var rememberDevice = this.get('rememberDevice');
        return Q($.post(url, data))
        .then(function () {
          return self.doTransaction(function(transaction) {
            var data;
            if (rememberDevice) {
              data = {rememberDevice: rememberDevice};
            }
            return transaction.poll(data);
          });
        })
        .fail(function (err) {
          self.trigger('error', self, err.xhr);
        });
      }
    },

    Form: {
      autoSave: true,
      noButtonBar: true,
      title: _.partial(Okta.loc, 'factor.duo'),
      attributes: { 'data-se': 'factor-duo' },

      postRender: function () {
        this.add('<iframe frameborder="0" title="' + this.title() + '"></iframe>');
        if (this.options.appState.get('allowRememberDevice')) {
          this.addInput({
            label: false,
            'label-top': true,
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            className: 'margin-btm-0',
            name: 'rememberDevice',
            type: 'checkbox'
          });
        }
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
      return this.model.getInitOptions()
      .then(function (trans) {
        var res = trans.data;
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

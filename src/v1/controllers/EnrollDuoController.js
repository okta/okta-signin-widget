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

/* eslint camelcase: 0*/
import { $, _, loc } from '@okta/courage';
import Duo from '@okta/duo';
import Q from 'q';
import FormController from 'v1/util/FormController';
import Footer from 'v1/views/enroll-factors/Footer';
export default FormController.extend({
  className: 'enroll-duo duo-form',

  Model: {
    props: {
      host: 'string',
      signature: 'string',
      postAction: 'string',
      factorId: 'string',
      stateToken: 'string',
    },

    getInitOptions: function() {
      return this.doTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'web',
          provider: 'DUO',
        });

        return factor.enroll();
      });
    },

    activate: function(signedResponse) {
      const url = this.get('postAction');
      const factorId = this.get('factorId');
      const self = this;
      const data = {
        id: factorId,
        stateToken: this.get('stateToken'),
        sig_response: signedResponse,
      };
      // Note: We should be doing this in OktaAuth! Fix when it's updated.

      // We don't actually use authClient.post() here (unlike all the other cases in the
      // sign-in widget) since the endpoint is wired to accept serialized form post instead
      // of a JSON post ($.post() is different from authClient.post() in that in $.post(),
      // jquery decides the Content-Type instead of it being a JSON type). Enroll/Verify DUO
      // are the only two places where we actually do this.
      // NOTE - If we ever decide to change this, we should test this very carefully.
      return Q($.post(url, data))
        .then(function() {
          return self.doTransaction(function(transaction) {
            return transaction.poll();
          });
        })
        .catch(function(err) {
          self.trigger('error', self, err.xhr);
        });
    },
  },

  Form: {
    autoSave: true,
    noButtonBar: true,
    title: _.partial(loc, 'enroll.duo.title', 'login'),

    postRender: function() {
      this.add('<iframe frameborder="0" title="' + this.title() + '"></iframe>');
      Duo.init({
        host: this.model.get('host'),
        sig_request: this.model.get('signature'),
        iframe: this.$('iframe').get(0),
        post_action: _.bind(this.model.activate, this.model),
      });
    },
  },

  Footer: Footer,

  fetchInitialData: function() {
    const self = this;

    return this.model.getInitOptions(this.options.appState).then(function(trans) {
      const res = trans.data;

      if (
        !res ||
        !res._embedded ||
        !res._embedded.factor ||
        !res._embedded.factor._embedded ||
        !res._embedded.factor._embedded.activation
      ) {
        throw new Error('Response does not have duo activation options');
      }

      const factor = res._embedded.factor;
      const activation = factor._embedded.activation;

      self.model.set({
        host: activation.host,
        signature: activation.signature,
        postAction: activation._links.complete.href,
        factorId: factor.id,
        stateToken: res.stateToken,
      });
    });
  },

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      return true;
    }
  },
});

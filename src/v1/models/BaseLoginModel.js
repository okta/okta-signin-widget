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

import { _, Model } from '@okta/courage';
import Q from 'q';
import Enums from 'util/Enums';
const KNOWN_ERRORS = ['OAuthError', 'AuthSdkError', 'AuthPollStopError', 'AuthApiError'];
export default Model.extend({
  // May return either a "standard" promise or a Q promise
  doTransaction: function(fn, rethrow) {
    const self = this;

    return fn
      .call(this, this.appState.get('transaction'))
      .then(function(trans) {
        self.trigger('setTransaction', trans);
        return trans;
      })
      .catch(function(err) {
        // Q may still consider AuthPollStopError to be unhandled
        if (
          err.name === 'AuthPollStopError' ||
          err.name === Enums.AUTH_STOP_POLL_INITIATION_ERROR ||
          err.name === Enums.WEBAUTHN_ABORT_ERROR
        ) {
          return;
        }
        self.trigger('error', self, err.xhr);
        self.trigger('setTransactionError', err);
        if (rethrow || _.indexOf(KNOWN_ERRORS, err.name) === -1) {
          throw err;
        }
      });
  },

  manageTransaction: function(fn) {
    const self = this;
    const res = fn.call(this, this.appState.get('transaction'), _.bind(this.setTransaction, this));

    // If it's a promise, listen for failures
    if (Q.isPromiseAlike(res)) {
      return res.catch(function(err) {
        if (
          err.name === 'AuthPollStopError' ||
          err.name === Enums.AUTH_STOP_POLL_INITIATION_ERROR ||
          err.name === Enums.WEBAUTHN_ABORT_ERROR
        ) {
          return;
        }
        self.trigger('error', self, err.xhr);
        self.trigger('setTransactionError', err);
      });
    }

    return Q.resolve(res);
  },

  startTransaction: function(fn) {
    const self = this;
    const res = fn.call(this, this.settings.getAuthClient());

    // If it's a promise, then chain to it
    if (Q.isPromiseAlike(res)) {
      return res
        .then(function(trans) {
          self.trigger('setTransaction', trans);
          return trans;
        })
        .catch(function(err) {
          self.trigger('error', self, err.xhr);
          self.trigger('setTransactionError', err);
          throw err;
        });
    }

    return Q.resolve(res);
  },

  setTransaction: function(trans) {
    this.appState.set('transaction', trans);
  },
});

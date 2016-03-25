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
  'vendor/lib/q'
],
function (Okta, Q) {

  var _ = Okta._;

  return Okta.Model.extend({
    doTransaction: function (fn, rethrow) {
      var self = this;
      return fn.call(this, this.appState.get('transaction'))
      .then(function(trans) {
        self.trigger('setTransaction', trans);
        return trans;
      })
      .fail(function(err) {
        if (err.name === 'AuthPollStopError') {
          return;
        }
        self.trigger('setTransactionError', err);
        self.trigger('error', self, err.xhr);
        if (rethrow) {
          throw err;
        }
      });
    },

    manageTransaction: function (fn) {
      var self = this,
          res = fn.call(this, this.appState.get('transaction'), _.bind(this.setTransaction, this));
      
      // If it's a promise, listen for failures
      if (Q.isPromise(res)) {
        res.fail(function(err) {
          if (err.name === 'AuthPollStopError') {
            return;
          }
          self.trigger('setTransactionError', err);
          self.trigger('error', self, err.xhr);
        });
      }

      return Q.resolve(res);
    },

    startTransaction: function (fn) {
      var self = this,
          res = fn.call(this, this.settings.getAuthClient());

      // If it's a promise, then chain to it
      if (Q.isPromise(res)) {
        return res.then(function(trans) {
          self.trigger('setTransaction', trans);
          return trans;
        })
        .fail(function(err) {
          self.trigger('setTransactionError', err);
          self.trigger('error', self, err.xhr);
          throw err;
        });
      }

      return Q.resolve(res);
    },

    setTransaction: function (trans) {
      this.appState.set('transaction', trans);
    }
  });
});

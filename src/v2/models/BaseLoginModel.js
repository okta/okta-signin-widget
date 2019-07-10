/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'q',
  'util/Enums',
],
function (Okta, Q) {
  return Okta.Model.extend({
    startTransaction: function (fn) {
      this.appState = this.options.appState;
      this.settings = this.options.settings;
      var self = this,
          res = fn.call(this, this.settings.getAuthClient());
      // If it's a promise, then chain to it
      if (Q.isPromiseAlike(res)) {
        return res.then(function (trans) {
          if (trans.remediation) {
            self.appState.trigger('remediationSuccess', trans);
          }
          return trans;
        })
          .fail(function (err) {
            self.trigger('error', self, err.xhr);
            self.appState.trigger('remediationFailure', err);
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

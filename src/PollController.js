/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'util/FormController',
],
function (Okta, FormController) {
  return FormController.extend({
    className: 'poll',
    Model: {
      save: function () {
        this.trigger('cancelRequest');
        return this.appState.get('transaction').cancel()
          .then(() => {
            this.options.appState.trigger('navigate', '');
          })
          .fail(() => {
            this._stopPolling();
          });
      },
    },
  
    Form: {
      autoSave: true,
      hasSavingState: false,
      title: function () {
        return this.title;
      },
      className: 'poll-controller',
      noCancelButton: true,
      save: Okta.loc('oform.cancel', 'login'),
      modelEvents: {
        'cancelRequest': '_stopPolling'
      },

      _startPolling: function () {
        // start polling request
        this.transaction.poll()
          .then((resp) => {
            this.options.appState.set('transaction', resp);
            const factorPollingInterval = resp.factor.profile.refresh;
            let factorPollingIntervalSeconds = Math.floor(factorPollingInterval/1000);
            // start one second countdown for next poll request
            this.countDown  = setInterval(() => {
              // update title
              const title = Okta.loc('polling.title','login', [factorPollingIntervalSeconds]);
              this.$el.find('.okta-form-title').text(title);
              if (factorPollingIntervalSeconds === 1) {
                // restart poll after countdown hit 1
                this._stopPolling();
                this._startPolling();
              } else {
                // reduce countdown after every second
                factorPollingIntervalSeconds = factorPollingIntervalSeconds-1;
              }
            }, 1000);
          })
          .fail(()=> {
            this._stopPolling();
          });
      },

      _stopPolling: function () {
        // clear polling
        if (this.countDown) {
          clearInterval(this.countDown);
        }
      },

      initialize: function (options) {
        this.transaction = options.appState.get('transaction');
        this.factorPollingInterval = this.transaction.factor.profile.refresh;
        const factorPollingIntervalSeconds = Math.floor(this.factorPollingInterval/1000);
        this.title = Okta.loc('polling.title','login', [factorPollingIntervalSeconds]);
      },
  
      postRender: function () {
        this._startPolling(this.factorPollingInterval);
      },
    },
  
    back: function () {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    },
  
  });
  
});
  
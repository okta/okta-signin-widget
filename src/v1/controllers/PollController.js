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

import { loc } from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
export default FormController.extend({
  className: 'poll',
  Model: {
    save: function() {
      this.trigger('cancelRequest');
      return this.appState
        .get('transaction')
        .cancel()
        .then(() => {
          this.options.appState.trigger('navigate', '');
        })
        .catch(() => {
          this._stopCountDown();
        });
    },
  },

  Form: {
    autoSave: true,
    hasSavingState: false,
    title: function() {
      return this.title;
    },
    className: 'poll-controller',
    noCancelButton: true,
    save: loc('oform.cancel', 'login'),
    modelEvents: {
      cancelRequest: '_stopCountDown',
    },
    formChildren: [
      FormType.View({
        View: '<div >\
               <div data-se="poll-waiting" class="hide okta-waiting-spinner"></div>\
             </div>',
      }),
    ],
    _checkStatus: function() {
      // start polling request
      this.transactionObject
        .poll()
        .then(resp => {
          if (resp.data && resp.status !== 'POLL') {
            this.options.appState.set('transaction', resp);
            return;
          }
          this.$('.okta-waiting-spinner').hide();
          let factorPollingIntervalSeconds = Math.ceil(resp.transaction.profile.refresh / 1000);
          this._startCountDown(factorPollingIntervalSeconds);
        })
        .catch(() => {
          this._stopCountDown();
        });
    },

    _startCountDown: function(factorPollingIntervalSeconds) {
      // start one second countdown for next poll request
      this.countDown = setInterval(() => {
        // update title after every second and check if countdown == 1 to poll again
        this._updateTitle(factorPollingIntervalSeconds);
        if (factorPollingIntervalSeconds === 0) {
          /* when countdown hits 0
                       - stop current poll
                       - show spinner
                       - check status
                      */
          this._stopCountDown();
          this.$('.okta-waiting-spinner').show();
          // start after a small delay so that the spinner does not get hidden too soon
          this.checkStatusTimeout = setTimeout(() => {
            this._checkStatus();
          }, 200);
        } else {
          // reduce countdown after every second
          factorPollingIntervalSeconds = factorPollingIntervalSeconds - 1;
        }
      }, 1000);
    },

    _updateTitle: function(factorPollingIntervalSeconds) {
      this.title = loc('polling.title', 'login', [factorPollingIntervalSeconds]);
      this.$el.find('.okta-form-title').text(this.title);
    },

    _stopCountDown: function() {
      // clear countdown setInterval
      if (this.countDown) {
        clearInterval(this.countDown);
      }
      // clear checkstatus setTimeout
      if (this.checkStatusTimeout) {
        clearInterval(this.checkStatusTimeout);
      }
    },

    initialize: function(options) {
      this.transactionObject = options.appState.get('transaction');
      this.factorPollingIntervalSeconds = Math.ceil(this.transactionObject.transaction.profile.refresh / 1000);
      this._updateTitle(this.factorPollingIntervalSeconds);
      this._startCountDown(this.factorPollingIntervalSeconds);
    },
  },

  back: function() {
    // Empty function on verify controllers to prevent users
    // from navigating back during 'verify' using the browser's
    // back button. The URL will still change, but the view will not
    // More details in OKTA-135060.
  },

  remove: function() {
    this.form._stopCountDown();
  },
});

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
  'util/FormController',
  'util/FormType',
  'views/shared/TextBox'
], function (Okta, FormController, FormType, TextBox) {

  return FormController.extend({
    className: 'device-probe',

    Model: {
      local: {
        stateToken: 'string',
      }
    },

    Form: {
      noButtonBar: true,
      formChildren: function () {
        return [
          FormType.Input({
            label: 'This is label',
            'label-top': true,
            className: 'make-me-invisible',
            name: 'stateToken',
            input: TextBox,
            type: 'text'
          })
        ];
      },
    },
  
    initialize: function () {
      this.stateTokenText = this.options.appState.get('transaction').data.stateToken;
      this.model.set('stateToken', this.stateTokenText);
      // this.add('<input type="text" id="state-token" value="abc" aria-hidden=true>');
    },

    preRender: function () {
      // this.options.appState.trigger('loading', false);
      var nonce = this.options.appState.attributes.transaction.probeInfo.nonce;
      var signals = this.options.appState.attributes.transaction.probeInfo.signals;
      var forceInstall = this.options.appState.attributes.transaction.probeInfo.forceInstall;
      var authenticatorDownloadLinks = this.options.appState.attributes.transaction.probeInfo.authenticatorDownloadLinks;

      var challenge = {
        signals: signals,
        nonce: nonce
      };
    },

    postRender: function () {
      const copyDom = this.$('[name="stateToken"]');
      copyDom.focus();
      this.copyTextToClipboard(this.stateTokenText);
    },

    fallbackCopyTextToClipboard: function (text) {
      var textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
    
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
    
      document.body.removeChild(textArea);
    },
  
    copyTextToClipboard: function (text) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text);
        return;
      }
      navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
          navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
          }, function(err) {
            console.error('Async: Could not copy text: ', err);
          });
        }
      });
    }
  });
});

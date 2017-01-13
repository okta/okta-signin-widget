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

/*jshint latedef:false */
/*global JSON */

define(['vendor/lib/q', 'jquery'], function (Q, $) {

  var iframeId = 'okta_fingerprint_iframe';

  function removeIframe() {
    var $fingerprintIFrame = $('#' + iframeId);
    $fingerprintIFrame.off();
    $fingerprintIFrame.remove();
  }

  return {
    generateDeviceFingerprint: function (oktaDomainUrl) {
      var deferred = Q.defer();

      function removeListener() {
        window.removeEventListener('message', onMessageReceivedFromOkta, false);
      }

      function handleError(reason) {
        removeIframe();
        removeListener();
        deferred.reject(reason);
      }

      function onMessageReceivedFromOkta(event) {
        /*jshint maxcomplexity:7*/
        if (!event || !event.data || event.origin != oktaDomainUrl) {
          handleError('no data');
        }
        try {
          var message = eval('(' + event.data + ')');
          if (message && message.type == 'FingerprintServiceReady') {
            var actionMessage = {};
            actionMessage.type = 'GetFingerprint';
            sendMessageToOkta(actionMessage);
          } else if (message && message.type == 'FingerprintAvailable') {
            removeIframe();
            removeListener();
            deferred.resolve(message.fingerprint);
          }
        } catch (error) {
          handleError(error);
          //Ignore any errors since we could get other messages too
        }
        handleError('no data');
      }

      function sendMessageToOkta(message) {
        var win = document.getElementById(iframeId).contentWindow;
        if (win) {
          win.postMessage(JSON.stringify(message), oktaDomainUrl);
        }
      }

      // Attach listener
      window.addEventListener('message', onMessageReceivedFromOkta, false);
      // Create iframe
      $('<iframe>', {
        src: oktaDomainUrl + '/auth/services/devicefingerprint',
        id:  iframeId,
        style: 'display: none;'
      }).appendTo('.auth-content');

      return deferred.promise;
    }
  };
});
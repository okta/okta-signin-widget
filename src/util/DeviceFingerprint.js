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

/* eslint complexity: [2, 7] */

define(['vendor/lib/q', 'okta/jquery'], function (Q, $) {

  return {
    generateDeviceFingerprint: function (oktaDomainUrl, element) {
      if (!navigator.userAgent) {
        return Q.reject('user agent is not defined');
      } else if (isWindowsPhone()) {
        return Q.reject('device fingerprint is not supported on Windows phones');
      }

      var deferred = Q.defer();

      // Create iframe
      var $iframe = $('<iframe>', {
        style: 'display: none;'
      });
      $iframe.appendTo(element);

      function isWindowsPhone() {
        return navigator.userAgent.match(/windows phone|iemobile|wpdesktop/i);
      }

      function removeIframe() {
        $iframe.off();
        $iframe.remove();
        window.removeEventListener('message', onMessageReceivedFromOkta, false);
      }

      function handleError(reason) {
        removeIframe();
        deferred.reject(reason);
      }

      function onMessageReceivedFromOkta(event) {
        if (!event || !event.data || event.origin != oktaDomainUrl) {
          handleError(event.origin + ' !== ' + oktaDomainUrl);
          return;
        }
        try {
          var message = JSON.parse(event.data);
          if (message && message.type === 'FingerprintServiceReady') {
            sendMessageToOkta({type: 'GetFingerprint'});
          } else if (message && message.type === 'FingerprintAvailable') {
            removeIframe();
            deferred.resolve(message.fingerprint);
          } else {
            handleError('no data');
          }
        } catch (error) {
          //Ignore any errors since we could get other messages too
        }
      }

      function sendMessageToOkta(message) {
        var win = $iframe[0].contentWindow;
        if (win) {
          win.postMessage(JSON.stringify(message), oktaDomainUrl);
        }
      }

      // Attach listener
      window.addEventListener('message', onMessageReceivedFromOkta, false);
      // Load devicefingerprint page inside the iframe
      $iframe.attr('src', oktaDomainUrl + '/auth/services/devicefingerprint');

      return deferred.promise;
    }
  };
});

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

import { $ } from '@okta/courage';
import Q from 'q';
export default {
  getUserAgent: function() {
    return navigator.userAgent;
  },
  isMessageFromCorrectSource: function($iframe, event) {
    return event.source === $iframe[0].contentWindow;
  },
  generateDeviceFingerprint: function(oktaDomainUrl, element) {
    const userAgent = this.getUserAgent();

    if (!userAgent) {
      return Q.reject('user agent is not defined');
    } else if (isWindowsPhone(userAgent)) {
      return Q.reject('device fingerprint is not supported on Windows phones');
    }

    const deferred = Q.defer();
    const self = this;
    let $iframe;
    let iFrameTimeout;

    function isWindowsPhone(userAgent) {
      return userAgent.match(/windows phone|iemobile|wpdesktop/i);
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
      if (!self.isMessageFromCorrectSource($iframe, event)) {
        return;
      }
      // deviceFingerprint service is available, clear timeout
      clearTimeout(iFrameTimeout);
      if (!event || !event.data || event.origin !== oktaDomainUrl) {
        handleError('no data');
        return;
      }
      try {
        const message = JSON.parse(event.data);

        if (message && message.type === 'FingerprintServiceReady') {
          sendMessageToOkta({ type: 'GetFingerprint' });
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
      const win = $iframe[0].contentWindow;

      if (win) {
        win.postMessage(JSON.stringify(message), oktaDomainUrl);
      }
    }

    // Attach listener
    window.addEventListener('message', onMessageReceivedFromOkta, false);
    // Create and Load devicefingerprint page inside the iframe
    $iframe = $('<iframe>', {
      css: {
        display: 'none'
      },
      src: oktaDomainUrl + '/auth/services/devicefingerprint',
    });
    element.append($iframe);

    iFrameTimeout = setTimeout(() => {
      // If the iFrame does not load, throw an error
      handleError('service not available');
    }, 2000);

    return deferred.promise;
  },
};

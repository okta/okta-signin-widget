/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// TODO: Use AuthJS for device fingerprinting: OKTA-418160
import { $ } from '@okta/courage';

function getUserAgent() {
  return navigator.userAgent;
}

function isWindowsPhone(userAgent) {
  return userAgent.match(/windows phone|iemobile|wpdesktop/i);
}

export default {
  isMessageFromCorrectSource($iframe, event) {
    return event.source === $iframe[0].contentWindow;
  },

  // NOTE: This utility is similar to the DeviceFingerprint.js file used for V1 authentication flows.
  generateDeviceFingerprint(fingerprintData) {
    return new Promise((resolve, reject) => {
      const userAgent = getUserAgent();
      if (!userAgent) {
        return reject('user agent is not defined');
      } else if (isWindowsPhone(userAgent)) {
        return reject('device fingerprint is not supported on Windows phones');
      }

      let $iframe;
      let iFrameTimeout;
      const self = this; // Needed for mocking

      function removeIframe() {
        $iframe.off();
        $iframe.remove();
        window.removeEventListener('message', onMessageReceivedFromOkta, false);
      }

      function handleError(reason) {
        removeIframe();
        reject(reason);
      }

      function onMessageReceivedFromOkta(event) {
        if (!self.isMessageFromCorrectSource($iframe, event)) {
          return;
        }
        // deviceFingerprint service is available, clear timeout
        clearTimeout(iFrameTimeout);
        if (!event || !event.data || event.origin !== fingerprintData.oktaDomainUrl) {
          handleError('no data');
          return;
        }
        try {
          const message = JSON.parse(event.data);

          if (message && message.type === 'FingerprintServiceReady') {
            sendMessageToOkta({
              type: 'GetFingerprint',
            });
          } else if (message && message.type === 'FingerprintAvailable') {
            removeIframe();
            resolve(message.fingerprint);
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
          win.postMessage(JSON.stringify(message), fingerprintData.oktaDomainUrl);
        }
      }

      // Attach listener
      window.addEventListener('message', onMessageReceivedFromOkta, false);
      // Create and Load devicefingerprint page inside the iframe
      $iframe = $('<iframe>', {
        css: {
          display: 'none'
        },
        src: fingerprintData.oktaDomainUrl + '/auth/services/devicefingerprint',
      });
      fingerprintData.element.append($iframe);

      iFrameTimeout = setTimeout(() => {
        // If the iFrame does not load or there is a slow connection, throw an error
        handleError('service not available');
      }, 2000);
    });
  }
};

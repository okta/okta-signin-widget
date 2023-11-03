/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { getUserAgent, isWindowsPhone } from './browserUtils';

export const isMessageFromCorrectSource = (iframe: HTMLIFrameElement, event: MessageEvent)
: boolean => (
  event.source === iframe.contentWindow
);

// NOTE: This utility is similar to the DeviceFingerprinting.js file used for V2 authentication flows.
export const generateDeviceFingerprint = (oktaDomainUrl: string): Promise<string> => {
  const userAgent = getUserAgent();
  if (!userAgent) {
    return Promise.reject(new Error('User agent is not defined'));
  }
  if (isWindowsPhone(userAgent)) {
    return Promise.reject(new Error('Device fingerprint is not supported on Windows phones'));
  }

  return new Promise((resolve, reject) => {
    let iframe: HTMLIFrameElement;
    let iframeTimeout: NodeJS.Timeout;
    let onMessageReceivedFromOkta: (event: MessageEvent) => void;

    const removeIframe = () => {
      iframe.remove();
      window.removeEventListener('message', onMessageReceivedFromOkta);
    };

    const handleError = (reason: string) => {
      removeIframe();
      reject(new Error(reason));
    };

    const sendMessageToOkta = (message: { type: string }) => {
      const win = iframe.contentWindow;

      if (win) {
        win.postMessage(JSON.stringify(message), oktaDomainUrl);
      }
    };

    onMessageReceivedFromOkta = (event: MessageEvent) => {
      if (!isMessageFromCorrectSource(iframe, event)) {
        return;
      }
      // deviceFingerprint service is available, clear timeout
      clearTimeout(iframeTimeout);
      if (!event || !event.data || event.origin !== oktaDomainUrl) {
        handleError('No data');
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
          handleError('No data');
        }
      } catch (error) {
        // Ignore any errors since we could get other messages too
      }
    };

    // Attach listener
    window.addEventListener('message', onMessageReceivedFromOkta, false);
    iframe = document.createElement('iframe');
    iframe.id = 'device-fingerprint-container';
    iframe.style.display = 'none';
    // Create and load devicefingerprint page inside the iframe
    iframe.src = `${oktaDomainUrl}/auth/services/devicefingerprint`;

    const formElement = document.querySelector('form[data-se="o-form"]');
    if (formElement === null) {
      handleError('Form does not exist');
    }
    formElement!.appendChild(iframe);

    iframeTimeout = setTimeout(() => {
      // If the iframe does not load or there is a slow connection, throw an error
      handleError('Service not available');
    }, 2000);
  });
};

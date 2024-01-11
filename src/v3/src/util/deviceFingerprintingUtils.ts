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
: boolean => event.source === iframe.contentWindow;

// NOTE: This utility is similar to the DeviceFingerprinting.js file used for V2 authentication flows.
export const generateDeviceFingerprint = (
  oktaDomainUrl: string,
  timeoutDuration?: number,
): Promise<string> => {
  const userAgent = getUserAgent();
  if (!userAgent) {
    return Promise.reject(new Error('User agent is not defined'));
  }
  if (isWindowsPhone(userAgent)) {
    return Promise.reject(new Error('Device fingerprint is not supported on Windows phones'));
  }

  let timeout: NodeJS.Timeout;
  let iframe: HTMLIFrameElement;
  let listener: (this: Window, ev: MessageEvent) => void;
  let msg;
  const formElement = document.querySelector('form[data-se="o-form"]');
  return new Promise<string>((resolve, reject) => {
    iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = 'device-fingerprint-container';

    listener = (event: MessageEvent) => {
      if (!isMessageFromCorrectSource(iframe, event)) {
        return undefined;
      }

      if (!event || !event.data || event.origin !== oktaDomainUrl) {
        return reject(new Error('No data'));
      }

      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        // iframe messages should all be parsable, skip not parsable messages that come from other
        // sources in the same origin (browser extensions)
        return undefined;
      }

      if (!msg) { return undefined; }
      if (msg.type === 'FingerprintAvailable') {
        return resolve(msg.fingerprint as string);
      } if (msg.type === 'FingerprintServiceReady') {
        const win = iframe.contentWindow;
        win?.postMessage(JSON.stringify({
          type: 'GetFingerprint',
        }), event.origin );
      } else {
        return reject(new Error('No data'));
      }
      return undefined;
    };
    window.addEventListener('message', listener, false);

    iframe.src = `${oktaDomainUrl}/auth/services/devicefingerprint`;
    if (formElement === null) {
      reject(new Error('Form does not exist'));
    }
    formElement!.appendChild(iframe);

    timeout = setTimeout(() => {
      // If the iframe does not load, receive the right message type, or there is a slow connection, throw an error
      reject(new Error('Device fingerprinting timed out'));
    }, timeoutDuration || 2000);
  }).finally(() => {
    clearTimeout(timeout);
    window.removeEventListener('message', listener);
    if (formElement?.contains(iframe)) {
      iframe.parentElement?.removeChild(iframe);
    }
  });
};

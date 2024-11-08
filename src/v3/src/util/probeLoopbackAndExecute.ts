/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { DeviceRemediation } from '../types';
import { loc } from './locUtil';
import Logger from '../../../util/Logger';
import Util from '../../../util/Util';
import { makeRequest } from './makeRequest';

const ADP_INSTALL_FALLBACK_REMEDIATION_KEY = 'idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install';

const getMessage = (fallback: DeviceRemediation['fallback']) => {
  switch (fallback.message?.i18n?.key) {
    case ADP_INSTALL_FALLBACK_REMEDIATION_KEY:
      // ADP fallback message has additional formatting
      return loc(
        fallback.message.i18n.key,
        'login',
        fallback.message.i18n.params,
        { $1: { element: 'span', attributes: { class: 'strong nowrap' } } },
      );
    default:
      return loc(fallback.message!.i18n.key, 'login', fallback.message!.i18n.params);
  }
};

const executeDeviceRemediationFallback = (fallback: DeviceRemediation['fallback'], action: string) => {
  switch (fallback.type) {
    case 'APP_LINK':
      // If/when loopback fails auto launch app link to install
      Util.executeOnVisiblePage(() => {
        Util.redirectWithFormGet(fallback.href);
      });
      break;
    case 'MESSAGE':
      // display updated message in place
      const siwContainer = document.getElementById('okta-sign-in');
      const elements = siwContainer?.querySelectorAll(`[data-se="${action}"]`);
      if (elements?.[0]) {
        elements[0].outerHTML = getMessage(fallback);
      }
      break;
    default: // Do nothing
  }
};

export const probeLoopbackAndExecute = async (deviceRemediation: DeviceRemediation) => {
  let remediationSucceeded = false;

  const baseUrls = deviceRemediation.ports.map((port) => `${deviceRemediation.domain}:${port}`);

  for (const baseUrl of baseUrls) {
    try {
      // probe the port
      const probeResponse = await makeRequest({
        method: 'GET',
        timeout: deviceRemediation.probeTimeoutMillis,
        url: `${baseUrl}/probe`,
      });

      if (!probeResponse.ok) {
        Logger.error(`Loopback is not listening on: ${baseUrl}.`);
        continue;
      }

      // attempt the remediation request with found port
      const remediationResponse = await makeRequest({
        url: `${baseUrl}/${deviceRemediation.action}`,
        method: 'GET',
        timeout: 300_000,
      });

      if (!remediationResponse.ok) {
        if (remediationResponse.status !== 503) {
          // return immediately
          return;
        }

        // try the next domain:port
        continue;
      }
      // remediation response was a 2xx, end probing
      remediationSucceeded = true;
      break;
    } catch (e) {
      // only for unexpected error conditions (e.g. fetch throws an error)
      Logger.error(`Something unexpected happened while we were checking url ${baseUrl}`);
    }
  }

  if (!remediationSucceeded) {
    // if remediation request was not made after probe, utilize fallback mechanism
    Logger.error('No available ports. Loopback server failed, triggering fallback.');

    executeDeviceRemediationFallback(deviceRemediation.fallback, deviceRemediation.action);
  }
};
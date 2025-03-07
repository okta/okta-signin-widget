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

import Logger from '../../../util/Logger';
import Util from '../../../util/Util';
import { DeviceRemediation } from '../types';
import { loc } from './locUtil';
import { makeRequest } from './makeRequest';

type ProbeDetails = {
  actionPath: string;
  probeTimeoutMillis: number;
  isSuccess: boolean;
};
const PROBE_PATH = 'probe';
const REMEDIATION_PATH = 'remediation';
const ADP_INSTALL_FALLBACK_REMEDIATION_KEY = 'idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install';

const getMessage = (fallback: DeviceRemediation['fallback']): string => {
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

const executeDeviceRemediationFallback = (
  fallback: DeviceRemediation['fallback'],
  action: string,
): void => {
  switch (fallback.type) {
    case 'APP_LINK': {
      // If/when loopback fails auto launch app link to install
      Util.executeOnVisiblePage(() => {
        Util.redirect(fallback.href, window, true);
      });
      break;
    }
    case 'MESSAGE': {
      // display updated message in place
      const siwContainer = document.getElementById('okta-sign-in');
      const elements = siwContainer?.querySelectorAll(`[data-se='${action}']`);
      if (elements?.[0]) {
        elements[0].outerHTML = getMessage(fallback);
      }
      break;
    }
    default: // do nothing
  }
};

const checkPort = (
  url: string,
  probeTimeoutMillis: number,
): Promise<Response> => makeRequest({
  method: 'GET',
  timeout: probeTimeoutMillis,
  url,
});

const onPortFound = (url: string, timeout: number): Promise<Response> => makeRequest({
  method: 'GET',
  url,
  timeout,
});

const probe = (baseUrl: string, probeDetails: ProbeDetails): Promise<void> => (
  checkPort(`${baseUrl}/${PROBE_PATH}`, probeDetails.probeTimeoutMillis)
    .then(() => (
      onPortFound(`${baseUrl}/${REMEDIATION_PATH}?action=${probeDetails.actionPath}`, probeDetails.probeTimeoutMillis)
        .then(() => {
          // eslint-disable-next-line no-param-reassign
          probeDetails.isSuccess = true;
        })))
    .catch(() => {
      Logger.error(`Something unexpected happened while we were checking url: ${baseUrl}.`);
      return Promise.reject();
    }));

export const probeLoopbackAndExecute = async (
  deviceRemediation: DeviceRemediation,
): Promise<void> => {
  const {
    action: actionPath,
    domain,
    ports,
    probeTimeoutMillis,
  } = deviceRemediation;
  const probeDetails: ProbeDetails = {
    actionPath,
    probeTimeoutMillis,
    isSuccess: false,
  };
  const totalPortCount = ports.length;
  let failedPortCount = 0;

  let probeChain = Promise.resolve();
  const baseUrls = ports.map((port) => `${domain}:${port}`);
  baseUrls.forEach((baseUrl) => {
    // no need to continue if we found the port and made a successful request
    if (probeDetails.isSuccess) {
      return;
    }

    probeChain = probeChain
      .then(() => probe(baseUrl, probeDetails))
      .catch((e) => {
        failedPortCount += 1;
        Logger.error(`Authenticator is not listening on: ${baseUrl}.`, e);
        if (failedPortCount >= totalPortCount && !probeDetails.isSuccess) {
          Logger.error('No available ports. Loopback server failed and using fallback mechanism.');
          executeDeviceRemediationFallback(
            deviceRemediation.fallback,
            deviceRemediation.action,
          );
        }
      });
  });
};

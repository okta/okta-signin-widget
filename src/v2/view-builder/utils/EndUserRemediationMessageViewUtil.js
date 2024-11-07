/*!
 * Copyright (c) 2024, Okta, Inc. and/or its affiliates. All rights reserved.
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
import hbs from '@okta/handlebars-inline-precompile';
import Logger from 'util/Logger';
import Util from 'util/Util';
import { getMessage } from '../../ion/i18nTransformer';

const PROBE_PATH = 'probe';
const ADP_INSTALL_FALLBACK_REMEDIATION_KEY = 'idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install';

const ajaxRequest = (requestOptions) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, requestOptions);
  return $.ajax(ajaxOptions);
};

const checkPort = (url, probeTimeoutMillis) => {
  return ajaxRequest({
    url: url,
    timeout: probeTimeoutMillis
  });
};

const onPortFound = (url, timeout) => {
  return ajaxRequest({
    url: url,
    method: 'GET',
    timeout: timeout,
  });
};

const probe = (baseUrl, probeDetails) => {
  return checkPort(`${baseUrl}/${PROBE_PATH}`, probeDetails.probeTimeoutMillis)
    .then(() => {
      return onPortFound(`${baseUrl}/${probeDetails.actionPath}`)
        .then(() => {
          probeDetails.foundPort = true;
        })
        .catch((xhr) => {
          probeDetails.failedPortCount++;
          if (xhr.status !== 503) {
            // for service unavailable error statuses
            // stop the remaining probing
            probeDetails.probingFailed = true;
          } else if (probeDetails.failedPortCount === probeDetails.totalPortCount) {
            probeDetails.probingFailed = true;
          }
        });
    })
    .catch(() => {
      Logger.error(`Something unexpected happened while we were checking url: ${baseUrl}.`);
      return $.Deferred().reject();
    });
};

const getFallbackMessage = (fallbackObj) => {
  switch (fallbackObj.message.i18n.key) {
    case ADP_INSTALL_FALLBACK_REMEDIATION_KEY:
      // ADP fallback message has additional formatting
      return hbs`{{i18n 
        code="idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install"
        bundle="login"
        $1="<span class='strong'>$1</span>"
      }}`();
    default:
      return getMessage(fallbackObj.message);
  }
};

const executeDeviceRemediationFallback = (fallback, action) => {
  switch (fallback.type) {
    case 'APP_LINK':
      // If/When loopback fails auto launch app link to install
      Util.executeOnVisiblePage(() => {
        Util.redirectWithFormGet(fallback.href);
      });
      break;
    case 'MESSAGE':
      // display updated message in place
      const adpRemediationEl = document.getElementById(action);
      if (adpRemediationEl) {
        adpRemediationEl.outerHTML = getFallbackMessage(fallback);
      }
      break;
    default: // Do nothing
  }
};

export const probeLoopbackAndExecute = (deviceRemediation) => {
  const domain = deviceRemediation.domain;
  const ports = deviceRemediation.ports;
  const probeDetails = {
    actionPath:  deviceRemediation.action,
    probeTimeoutMillis: deviceRemediation.probeTimeoutMillis,
    totalPortCount: ports.length,
    failedPortCount: 0,
    foundPort: false,
    probingFailed: false,
  };

  let probeChain = Promise.resolve();
  const baseUrls = ports.map((port) => `${domain}:${port}`);
  baseUrls.forEach(baseUrl => {
    probeChain = probeChain.then(() => {
      if (!(probeDetails.foundPort || probeDetails.probingFailed)) {
        return probe(baseUrl, probeDetails);
      }
    })
    .catch((e) => {
      probeDetails.failedPortCount++;
      Logger.error(`Authenticator is not listening on: ${baseUrl}.`);
      if (probeDetails.failedPortCount === probeDetails.totalPortCount) {
        Logger.error('No available ports. Loopback server failed and using fallback mechanism.');
        executeDeviceRemediationFallback(deviceRemediation.fallback, deviceRemediation.action);
      }
    });
  });
};

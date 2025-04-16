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
import Enums from 'util/Enums';
import hbs from '@okta/handlebars-inline-precompile';
import Logger from 'util/Logger';
import Util from 'util/Util';
import { getMessage } from '../../ion/i18nTransformer';

const PROBE_PATH = 'probe';
// eslint-disable-next-line max-len
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

const getFallbackMessage = (fallbackObj) => {
  switch (fallbackObj.message.i18n.key) {
  case ADP_INSTALL_FALLBACK_REMEDIATION_KEY:
    // ADP fallback message has additional formatting
    // eslint-disable-next-line max-len
    return hbs`{{i18n code="idx.error.code.access_denied.device_assurance.remediation.android.zero.trust.android_device_policy_app_required_manual_install"
      bundle="login"
      $1="<span class='strong'>$1</span>"
    }}`();
  default:
    return getMessage(fallbackObj.message);
  }
};

const executeDeviceRemediationFallback = (fallback, action) => {
  switch (fallback.type) {
  case 'APP_LINK': {
    // If/When loopback fails auto launch app link to install
    Util.executeOnVisiblePage(() => {
      Util.redirect(fallback.href, window, true);
    });
    break;
  }
  case 'MESSAGE': {
    // display updated message in place
    const siwContainer = document.getElementById(Enums.WIDGET_CONTAINER_ID);
    if (!siwContainer) {
      Logger.error('Cannot find okta-sign-in container to display message');
      return;
    }
    const remediationMsgElements = siwContainer.querySelectorAll(`[data-se="${action}"]`);
    if (remediationMsgElements && remediationMsgElements[0]) {
      remediationMsgElements[0].outerHTML = getFallbackMessage(fallback);
    }
    break;
  }}
};

const probe = (baseUrl, probeDetails) => {
  return checkPort(`${baseUrl}/${PROBE_PATH}`, probeDetails.probeTimeoutMillis)
    .then(() => {
      const loopbackRemediationPath = `${baseUrl}/${probeDetails.remediationPath}/${probeDetails.actionPath}`;
      return onPortFound(loopbackRemediationPath, probeDetails.probeTimeoutMillis)
        .then(() => {
          probeDetails.isSuccess = true;
        });
    })
    .catch(() => {
      Logger.error(`Something unexpected happened while we were checking url: ${baseUrl}.`);
      return $.Deferred().reject();
    });
};

export const hasDeviceRemediationAction = (message) => {
  return message.deviceRemediation
    && message.deviceRemediation.value
    && message.deviceRemediation.value.action;
};

export const isLoopbackDeviceRemediation = (deviceRemediation) => {
  return deviceRemediation && deviceRemediation.remediationType === 'LOOPBACK';
};

export const probeLoopbackAndExecute = (deviceRemediation) => {
  const domain = deviceRemediation.domain;
  const ports = deviceRemediation.ports;
  const totalPortCount = ports.length;
  let failedPortCount = 0;
  const probeDetails = {
    remediationPath: deviceRemediation.remediationPath,
    actionPath:  deviceRemediation.action,
    probeTimeoutMillis: deviceRemediation.probeTimeoutMillis,
    isSuccess: false,
  };

  let probeChain = Promise.resolve();
  const baseUrls = ports.map((port) => `${domain}:${port}`);
  baseUrls.forEach(baseUrl => {
    // no need to continue if we found the port and made a successful request
    if (probeDetails.isSuccess) {
      return;
    }
    probeChain = probeChain.then(() => probe(baseUrl, probeDetails)).catch(() => {
      failedPortCount += 1;
      Logger.error(`Authenticator is not listening on: ${baseUrl}.`);
      if (failedPortCount >= totalPortCount && !probeDetails.isSuccess) {
        Logger.error('No available ports. Loopback server failed and using fallback mechanism.');
        executeDeviceRemediationFallback(deviceRemediation.fallback, deviceRemediation.action);
      }
    });
  });
};

/*!
 * Copyright (c) 2021, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// This file attempts to mimic the behavior of a popular hack of the V1 Router, which allowed for the widget to be
// initialized into a specific form/flow (like Register or Reset Password). To achieve this, an attempt is made to
// call `idxState.proceed()` with a known remediation depending on the `flow` configuration to "step" the widget
// (and the server's state) to the desired flow/form. The remediation is not guaranteed to be available 
// and will default to the original idx response otherwise. This depends on the Org configurations
import Errors from 'util/Errors';
import Logger from 'util/Logger';
import { interact } from './interact';
import {
  getTransactionMeta,
  getSavedTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
} from './transactionMeta';
import { FORMS } from '../ion/RemediationConstants';
import { CONFIGURED_FLOW } from './constants';


// checks if "desired" remeidation is available before calling `.proceed`
// if not available, returns original idxResponse (and logs warning)
async function proceedIfAvailable(idxState, remediation, flow) {
  const rem = idxState.neededToProceed.find(item => item.name === remediation);
  if (!rem) {
    Logger.warn('Expected remediation not found, Org may be misconfigured for this flow');
    return idxState;
  }

  try {
    const nextIdxState = await idxState.proceed(remediation);
    return nextIdxState;
  }
  catch (err) {
    // catches and handles `Unknown remediation` errors thrown okta-idx-js
    if (typeof err === 'string' && err.startsWith('Unknown remediation choice')) {
      Logger.warn(`flow [${flow}] not valid with current Org configurations`);
      return idxState;
    }
    else {
      // do not catch non-`Unknown remediation` errors here
      throw err;
    }
  }
}

// attempts to "step into" a specific flow by calling `.proceed` with a specific remeidation (or calls an action)
// the "desired" remeidation is not guaranteed to be available, depends upon Org configurations
async function stepIntoSpecificIdxFlow(idxState, flow='') {
  switch (flow) {
  case CONFIGURED_FLOW.DEFAULT:
  case CONFIGURED_FLOW.PROCEED:
  case CONFIGURED_FLOW.LOGIN:
    // default IDX response from interact is "Login" page/flow. Do nothing
    return idxState;

  case CONFIGURED_FLOW.REGISTRATION:
    return await proceedIfAvailable(idxState, FORMS.SELECT_ENROLL_PROFILE, flow);

  case CONFIGURED_FLOW.RESET_PASSWORD:
    return idxState.actions['currentAuthenticator-recover'] ?
      await idxState.actions['currentAuthenticator-recover']() : idxState;

  case CONFIGURED_FLOW.UNLOCK_ACCOUNT:
    // requires: introspect -> identify-recovery -> select-authenticator-unlock-account
    return await proceedIfAvailable(idxState, FORMS.UNLOCK_ACCOUNT, flow);

  default:
    Logger.warn(`Unknown \`flow\` value: ${flow}`);
    throw new Errors.ConfigError('Invalid "flow" configuration');
  }
}

// ensures the `flow` stored in the transaction meta matches the flow configuration
// if they do not match, abandon the current (meta) flow and start a new (configured) flow
export async function handleConfiguredFlow(originalResp, settings) {
  const configuredFlow = settings.get('flow');

  if (!configuredFlow || configuredFlow === CONFIGURED_FLOW.DEFAULT || configuredFlow === CONFIGURED_FLOW.PROCEED) {
    return originalResp;
  }

  let idxState = originalResp;

  const meta = await getTransactionMeta(settings);

  if (meta.flow && meta.flow !== configuredFlow) {
    // configured flow and active flow do not match, abandon active flow, start new (configured) flow
    Logger.warn(`Canceling current '${meta.flow}' flow to start '${configuredFlow}' flow`);
    clearTransactionMeta(settings);
    idxState = await interact(settings);
  }

  // attempts to step into the desired flow
  idxState = await stepIntoSpecificIdxFlow(idxState, configuredFlow);

  // meta could have been mutated since the first `getTransactionMeta` call in this function
  // retrieve again before writing to the transaction, otherwise the n-1 idx call is saved
  const currMeta = await getSavedTransactionMeta(settings);
  const newMeta = Object.assign({}, {...currMeta}, {flow: configuredFlow});
  saveTransactionMeta(settings, newMeta);

  return idxState;
}

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

import Errors from 'util/Errors';
import { emailVerifyCallback } from './emailVerifyCallback';
import { interact } from './interact';
import { introspect } from './introspect';
import sessionStorageHelper from './sessionStorageHelper';
import {
  getTransactionMeta,
  saveTransactionMeta,
  clearTransactionMeta,
} from './transactionMeta';

const handleProxyIdxResponse = async (settings) => {
  return Promise.resolve({
    rawIdxState: settings.get('proxyIdxResponse'),
    context: settings.get('proxyIdxResponse'),
    neededToProceed: [],
  });
};

async function startSpecificIdxFlow(originalIdxResp, flow='') {
  console.log('trying to start flow: ', originalIdxResp, flow);
  let idxResponse = originalIdxResp;

  try {
    if (flow === 'login') {
      // TODO: revisit, based on assumption `identify` is the top-most remediation. Confirm this?
      // return idxResponse.proceed('identify');
    }
    else if (flow === 'register') {
      idxResponse = await idxResponse.proceed('select-enroll-profile');
    }
    else if (flow === 'reset-password') {
      // if `currentAuthenticator-recover` action is not available on the parsed idxResponse,
      // reject an InitialFlowError to be caught in `handleOieRender`, this mimics a bad .proceed() call
      // TODO: review this, it seems very hacky
      idxResponse = idxResponse.actions['currentAuthenticator-recover'] ?
        idxResponse.actions['currentAuthenticator-recover']() :
        Promise.reject(new Errors.InitialFlowError('Unable to invoke desired action', flow));
    }
    else if (flow === 'unlock') {
      // requires: introspect -> identify-recovery -> select-authenticator-unlock-account
      idxResponse = await idxResponse.proceed('identify-recovery');
    }
    else {
      Logger.warn(`Unknown \`flow\` value: ${flow}`);
    }

    // default to original idx response
    return idxResponse;
  }
  catch (err) {
    // catches and handles `Unknown remediation` errors thrown okta-idx-js
    if (typeof err === 'string' && err.startsWith('Unknown remediation choice')) {
      Logger.warn(`initialView [${flow}] not valid with current Org configurations`);
      throw new Errors.InitialFlowError('Unable to proceed to desired view', flow);
    }
    else {
      // do not catch non-`Errors.InitialFlowError` errors here
      throw err;
    }
  }
}

async function continueIdxFlow(settings) {
  // TODO: remove
  // return startIdxFlow(settings);

  const meta = await getTransactionMeta(settings);

  // /**
  //  * Definition 1 - uses idx.client.interceptor to "cache" and replicate last idx call on page load
  //  */
  // if (!meta.lastFlowOperation) {
  //   // TODO: review this???
  //   return startIdxFlow(settings);
  // }

  // const { url, ...params } = meta.lastFlowOperation;
  // const req = await request(url, params);
  // if (req.ok) {
  //   const body = await req.json();
  //   return idx.makeIdxState(body);
  // }
  // else {
  //   const { messages, ...body } = await req.json();
  //   return idx.makeIdxState(body);
  // }

  /**
   * Definition 2 - listens to 'updateAppState' and "caches" rawIdxState to be loaded from transactionMeta on page load
   */

  if (!meta.lastRawIdx) {
    // TODO: review this???
    return startIdxFlow(settings);
  }

  return idx.makeIdxState(meta.lastRawIdx);
}

async function startIdxFlow(settings) {
  // Return a preset response
  if (settings.get('proxyIdxResponse')) {
    return handleProxyIdxResponse(settings);
  }

  if (settings.get('overrideExistingStateToken')) {
    sessionStorageHelper.removeStateHandle();
  }

  if (settings.get('stateTokenExternalId')) {
    return emailVerifyCallback(settings);
  }

  if (settings.get('useInteractionCodeFlow')) {
    // Use stateToken from session storage if exists
    // See more details at ./docs/use-session-token-prior-to-settings.png
    const stateHandleFromSession = sessionStorageHelper.getStateHandle();
    if (stateHandleFromSession) {
      return introspect(settings, stateHandleFromSession)
        .then((idxResp) => {
          // 1. abandon the settings.stateHandle given session.stateHandle is still valid
          settings.set('stateToken', stateHandleFromSession);
          // 2. chain the idxResp to next handler
          return idxResp;
        })
        .catch(() => {
          // 1. remove session.stateHandle
          sessionStorageHelper.removeStateHandle();
          // 2. start the login again in order to introspect on settings.stateHandle
          return startIdxFlow(settings);
        });
    }

    // Use stateToken from options
    const stateHandle = settings.get('stateToken');
    if (stateHandle) {
      return introspect(settings, stateHandle);
    }

    console.log('calling interact??')
    return interact(settings);
  }

  throw new Errors.ConfigError('Set "useInteractionCodeFlow" to true in configuration to enable the ' +
    'interaction_code" flow for self-hosted widget.');
}

export async function startLoginFlow(settings, appState) {
  console.log('####  startLoginFlow called   ####');
  // const originalResp = await startIdxFlow(settings);      // defaults to login flow
  let idxResponse = null;

  console.log(idx.client.interceptors.request);

  try {
    const configuredFlow = settings.get('initialView');
    if (configuredFlow) {
      const meta = await getTransactionMeta(settings);

      if (meta.flow !== configuredFlow) {
        if (meta.flow) {
          // configured flow and active flow do not match, abandon active flow, start new (configured) flow
          Logger.warn(`Cancelling current '${meta.flow}' flow to start '${configuredFlow}' flow`);
          sessionStorageHelper.removeStateHandle();
          clearTransactionMeta(settings);
        }

        // flow is configured (via settings), but no transaction meta exists for an active flow
        idxResponse = await startSpecificIdxFlow(idxResponse, configuredFlow);
        console.log('idxResponse2', idxResponse);
        // TODO: can we assume the flow has "started" successfully if we don't error within `startSpecificIdxFlow`???
        const newMeta = Object.assign({}, {...meta}, {flow: configuredFlow});
        saveTransactionMeta(settings, newMeta);
      }
    }
  }
  catch (err) {
    console.log(err);
    if (err instanceof Errors.InitialFlowError) {
      // TODO: add meaningful "error" message, explaining to user why flow was interrupted
      if (idxResponse.messages) {
        idxResponse.messages = {type:'array', value: []};
      }
      idxResponse.messages.push({message: 'Please contact Jeff'});
    }
    else {
      // do not catch unknown errors here
      throw err;
    }
  }
  finally {
    settings.set('initialView', false);
  }

    const meta2 = await getTransactionMeta(settings);
    console.log('meta2: ', meta2);

export async function startLoginFlow(settings) {
  // Return a preset response
  if (settings.get('proxyIdxResponse')) {
    return handleProxyIdxResponse(settings);
  }

  if (settings.get('overrideExistingStateToken')) {
    sessionStorageHelper.removeStateHandle();
  }

  // Use interaction code flow, if enabled
  if (settings.get('useInteractionCodeFlow')) {
    return startInteractionCodeFlow(settings);
  }

  // Use stateToken from session storage if exists
  // See more details at ./docs/use-session-token-prior-to-settings.png
  const stateHandleFromSession = sessionStorageHelper.getStateHandle();
  if (stateHandleFromSession) {
    return introspect(settings, stateHandleFromSession)
      .then((idxResp) => {
        // 1. abandon the settings.stateHandle given session.stateHandle is still valid
        settings.set('stateToken', stateHandleFromSession);
        // 2. chain the idxResp to next handler
        return idxResp;
      })
      .catch(() => {
        // 1. remove session.stateHandle
        sessionStorageHelper.removeStateHandle();
        // 2. start the login again in order to introspect on settings.stateHandle
        return startLoginFlow(settings);
      });
  }

  // Use stateToken from options
  const stateHandle = settings.get('stateToken');
  if (stateHandle) {
    return introspect(settings, stateHandle);
  }

  throw new Errors.ConfigError('Set "useInteractionCodeFlow" to true in configuration to enable the ' +
    'interaction_code" flow for self-hosted widget.');
}

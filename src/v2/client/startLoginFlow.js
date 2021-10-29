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
import { getTransactionMeta, saveTransactionMeta, clearTransactionMeta } from './transactionMeta';
import sessionStorageHelper from './sessionStorageHelper';

const handleProxyIdxResponse = async (settings) => {
  return Promise.resolve({
    rawIdxState: settings.get('proxyIdxResponse'),
    context: settings.get('proxyIdxResponse'),
    neededToProceed: [],
  });
};

// const recover = 

async function startSpecificIdxFlow (originalIdxResp, flow='') {
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
        (idxResponse.actions['currentAuthenticatorEnrollment-recover'] ?
        idxResponse.actions['currentAuthenticatorEnrollment-recover']() :
        Promise.reject(new Errors.InitialFlowError('Unable to invoke desired action', flow)));
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

export async function startLoginFlow(settings) {
  console.log('####  startLoginFlow called   ####');
  // const originalResp = await startIdxFlow(settings);      // defaults to login flow
  let idxResponse = null;

  try {
    // `initialView` settings is cleared in `finally` block, so this logic only runs on first render
    const configuredFlow = settings.get('initialView');
    if (configuredFlow) {
      const meta = await getTransactionMeta(settings);
      // console.log('meta: ', meta);

      if (meta.flow && meta.flow !== configuredFlow) {
        Logger.warn(`Cancelling current '${meta.flow}' flow to start '${configuredFlow}' flow`);
        // idxResponse = await idxResponse.actions.cancel();
        sessionStorageHelper.removeStateHandle();
        clearTransactionMeta(settings);
        idxResponse = await interact(settings);
      }
      else {
        idxResponse = await startIdxFlow(settings);
      }

      // if (meta.flow) {
      //   if (meta.flow === configuredFlow) {
      //     Logger.warn(`'${meta.flow}' flow already started, continuing...`);
      //     sessionStorageHelper.setStateHandle(meta?.flowHandle);
      //     idxResponse = await startIdxFlow(settings);
      //     // idxResponse = await introspect(settings, meta.flowHandle);
      //     console.log('idxResponse1', idxResponse);
      //     return { idxResponse };
      //   }
      //   else {
      //     Logger.warn(`Cancelling current '${meta.flow}' flow to start '${configuredFlow}' flow`);
      //     // idxResponse = await idxResponse.actions.cancel();
      //     sessionStorageHelper.removeStateHandle();
      //     clearTransactionMeta(settings);
      //     idxResponse = await interact(settings);
      //   }
      // }
      // else {
      //   idxResponse = await startIdxFlow(settings);
      // }

      if (!meta.flow) {
        idxResponse = await startSpecificIdxFlow(idxResponse, configuredFlow);
        console.log('idxResponse2', idxResponse);
        // TODO: can we assume the flow has "started" successfully if we don't error within `startSpecificIdxFlow`???
        const newMeta = Object.assign({}, {...meta}, {flow: configuredFlow, flowHandle: idxResponse?.context?.stateHandle});
        saveTransactionMeta(settings, newMeta);

        sessionStorageHelper.setStateHandle(idxResponse?.context?.stateHandle);
      }
    }
    else {
      idxResponse = await startIdxFlow(settings);
    }

    return { idxResponse };
  }
  catch (err) {
    console.log(err);
    if (err instanceof Errors.InitialFlowError) {
      // TODO: add meaningful "error" message, explaining to user why flow was interrupted
      return { idxResponse, message: 'Please contact Jeff'};
    }
    else {
      // do not catch unknown errors here
      throw err;
    }
  }
  finally {
    // clear setting to prevent "initializing a specific flow" on subsequent calls to `startLoginFlow`
    // this should only happen on the first call, during bootstrapping
    settings.set('initialView', false);

    // const meta2 = await getTransactionMeta(settings);
    // console.log('meta2: ', meta2);

    // TODO: remove this
    // const resp = await introspect(settings, idxResponse.rawIdxState.stateHandle);
    // console.log('idxResponse3', resp);
  }
}
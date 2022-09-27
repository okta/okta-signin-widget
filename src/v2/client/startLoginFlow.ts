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

import { ConfiguredFlowError, ConfigError } from 'util/Errors';
import { emailVerifyCallback } from './emailVerifyCallback';
import sessionStorageHelper from './sessionStorageHelper';
import { CONFIGURED_FLOW } from './constants';
import { IdxTransactionMeta, ProceedOptions } from '@okta/okta-auth-js';

const handleProxyIdxResponse = async (settings) => {
  return Promise.resolve({
    rawIdxState: settings.get('proxyIdxResponse'),
    context: settings.get('proxyIdxResponse'),
    neededToProceed: [],
  });
};

/* eslint max-depth: [2, 3] */
// eslint-disable-next-line complexity, max-statements
export async function startLoginFlow(settings) {
  const authClient = settings.getAuthClient();
  // nonce is not a top-level auth-js option, must be passed in manually
  const { authParams } = settings.toJSON({verbose: true});
  const nonce = settings.get('nonce') || authParams?.nonce;
  const idxOptions: ProceedOptions = {
    exchangeCodeForTokens: false, // we handle this in interactionCodeFlow.js
    ...(nonce && { nonce })
  };

  // Return a preset response
  if (settings.get('proxyIdxResponse')) {
    return handleProxyIdxResponse(settings);
  }

  if (settings.get('overrideExistingStateToken')) {
    sessionStorageHelper.removeStateHandle();
  }

  if (settings.get('otp')) {
    return emailVerifyCallback(settings);
  }

  if (settings.get('oauth2Enabled')) {
    const meta: IdxTransactionMeta = await authClient.idx.getSavedTransactionMeta();
    if (!meta) {
      // no saved transaction
      // if the configured flow is set to `proceed`, the SIW should only continue an existing idx transaction
      // if the SIW loads from a fresh state (there is no current transaction), throw an error
      const flow = authClient.idx.getFlow();
      if (flow && flow === CONFIGURED_FLOW.PROCEED) {
        throw new ConfiguredFlowError(
          'Unable to proceed: saved transaction could not be loaded', flow
        );
      }
      // start new transaction
      return authClient.idx.start(idxOptions); // calls interact
    }

    // continue saved transaction
    return authClient.idx.proceed(idxOptions); // calls introspect
  }

  // Use stateToken from session storage if exists
  // See more details at ./docs/use-session-token-prior-to-settings.png
  const stateHandleFromSession = sessionStorageHelper.getStateHandle();
  if (stateHandleFromSession) {
    try {
      const idxResp = await authClient.idx.start({
        ...idxOptions,
        stateHandle: stateHandleFromSession
      });
      const hasError = idxResp.context?.messages?.value.length > 0;
      if (hasError) {
        throw new Error('saved stateToken is invalid'); // will be caught in this function
      }

      // 1. abandon the settings.stateHandle given session.stateHandle is still valid
      settings.set('stateToken', stateHandleFromSession);
      // 2. chain the idxResp to next handler
      return idxResp;
    } catch {
      // 1. remove session.stateHandle
      sessionStorageHelper.removeStateHandle();
      // 2. start the login again in order to introspect on settings.stateHandle
      return startLoginFlow(settings);
    }
  }

  // Use stateToken from options
  const stateHandle = settings.get('stateToken');
  if (stateHandle) {
    return authClient.idx.start({
      ...idxOptions,
      stateHandle
    });
  }

  throw new ConfigError('Invalid OIDC configuration. Set "clientId" and "redirectUri" in the widget options.');
}

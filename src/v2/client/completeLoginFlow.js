/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import Enums from 'util/Enums';
import Errors from 'util/Errors';
import { toQueryString } from '@okta/okta-auth-js';

import { clearTransactionMeta } from './transactionMeta';

export async function completeLoginFlow (settings, idxResponse) {
  const { interactionCode } = idxResponse;
  const authClient = settings.getAuthClient();
  const transactionMeta = authClient.transactionManager.load();
  const shouldRedirect = settings.get('mode') === 'remediation';

  // Should this transaction be completed at the `redirectUri` ?
  if (shouldRedirect) {
    const redirectUri = settings.get('redirectUri');
    if (!redirectUri) {
      throw new Errors.ConfigError('"redirectUri" is required');
    }
    const { state } = transactionMeta;
    const qs = toQueryString({ 'interaction_code': interactionCode, state });
    window.location.replace(redirectUri + qs);
    return;
  }
  
  // Complete the transaction client-side and call success/resolve promise
  const { codeVerifier } = transactionMeta;
  return authClient.token.exchangeCodeForTokens({ codeVerifier, interactionCode })
    .then(({ tokens }) => {
      settings.callGlobalSuccess(Enums.SUCCESS, { tokens });
    })
    .catch(err => {
      settings.callGlobalError(err);
    })
    .finally(() => {
      // clear all meta related to this transaction
      clearTransactionMeta(settings);
    });
}

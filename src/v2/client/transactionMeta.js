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

import Logger from 'util/Logger';

// Calculate new values
export async function createTransactionMeta(settings) {
  const authClient = settings.getAuthClient();
  return authClient.token.prepareTokenParams();
}

export async function getTransactionMeta(settings) {
  const authClient = settings.getAuthClient();

  // Load existing transaction meta from storage
  if (authClient.transactionManager.exists()) {
    const existing = authClient.transactionManager.load();
    if (isTransactionMetaValid(settings, existing)) {
      return existing;
    }
    // existing meta is not valid for this configuration
    // this is common when changing configuration in local development environment
    // in a production environment, this may indicate that two apps are sharing a storage key
    Logger.warn('Saved transaction meta does not match the current configuration. ' + 
      'This may indicate that two apps are sharing a storage key.');
  }

  // New transaction

  let interactionHandle = settings.get('interactionHandle');
  let codeChallenge = settings.get('codeChallenge');
  let codeChallengeMethod = settings.get('codeChallengeMethod');

  const meta = await createTransactionMeta(settings);
  if (interactionHandle) {
    meta.interactionHandle = interactionHandle;
  }
  if (codeChallenge) {
    meta.codeChallenge = codeChallenge;
  }
  if (codeChallengeMethod) {
    meta.codeChallengeMethod = codeChallengeMethod;
  }

  return meta;
}

export function saveTransactionMeta(settings, meta) {
  const authClient = settings.getAuthClient();
  authClient.transactionManager.save(meta);
}

export function clearTransactionMeta(settings) {
  const authClient = settings.getAuthClient();
  authClient.transactionManager.clear();
}

export function isTransactionMetaValid(settings, meta) {
  // returns false if values in meta do not match current authClient options
  // this logic can be moved to okta-auth-js OKTA-371584
  const authOptions = ['clientId', 'redirectUri'];
  const authClient = settings.getAuthClient();
  const mismatch = authOptions.find(key => {
    return authClient.options[key] !== meta[key];
  });
  if (mismatch) {
    return false;
  }

  // if `interactionHandle` option was provided, validate it against the meta
  const interactionHandle = settings.get('interactionHandle');
  if (interactionHandle && meta.interactionHandle !== interactionHandle) {
    return false;
  }

  // if `codeChallenge` option was provided, validate it against the meta
  const codeChallenge = settings.get('codeChallenge');
  if (codeChallenge && meta.codeChallenge !== codeChallenge) {
    return false;
  }

  // if `codeChallengeMethod` option was provided, validate it against the meta
  const codeChallengeMethod = settings.get('codeChallengeMethod');
  if (codeChallengeMethod && meta.codeChallengeMethod !== codeChallengeMethod) {
    return false;
  }

  return true;
}
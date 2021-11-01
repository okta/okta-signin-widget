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
  const meta = await authClient.token.prepareTokenParams({
    codeChallengeMethod: settings.get('codeChallengeMethod')
  });

  // Some parameters can be overriden in settings
  const codeChallenge = settings.get('codeChallenge');
  if (codeChallenge) {
    meta.codeChallenge = codeChallenge;
  }
  const codeChallengeMethod = settings.get('codeChallengeMethod');
  if (codeChallengeMethod) {
    meta.codeChallengeMethod = codeChallengeMethod;
  }
  return meta;
}

export async function getTransactionMeta(settings) {
  const authClient = settings.getAuthClient();
  const state = authClient.options.state;

  if (!authClient.transactionManager.exists({ state })) {
    return;
  }

  // Load existing transaction meta from shared localStorage, if possible
  // Matching state loads transaction storage from localStorage. No match loads from sessionStorage. 
  // Can be disabled by setting `authParams.transactionManager.enableSharedStorage=false` in widget options
  const existing = authClient.transactionManager.load({ state });
  if (existing) {
    if (isTransactionMetaValid(settings, existing)) {
      return existing;
    }
    // existing meta is not valid for this configuration
    // this is common when changing configuration in local development environment
    // in a production environment, this may indicate that two apps are sharing a storage key
    Logger.warn('Saved transaction meta does not match the current configuration. ' + 
      'This may indicate that two apps are sharing a storage key.');
  }
}

// Retuns saved meta, if it exists, or creates new meta
export async function getTransactionMeta(settings) {
  const existing = await getSavedTransactionMeta(settings);
  if (existing) {
    return existing;
  }

  // New transaction
  const meta = await createTransactionMeta(settings);
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

function validateAuthClientOptions(settings, meta) {
  // returns false if values in meta do not match current authClient options
  // this logic can be moved to okta-auth-js OKTA-371584
  const authOptions = ['clientId', 'redirectUri'];
  const authClient = settings.getAuthClient();
  const mismatch = authOptions.some(key => {
    if (authClient.options[key] !== meta[key]) {
      Logger.warn(`Saved transaction meta does not match on key '${key}'`);
      return true;
    }
  });
  return !mismatch;
}

function validateWidgetOptions(settings, meta) {
  // returns false if values in meta do not match current widget options
  const widgetOptions = ['state', 'codeChallenge', 'codeChallengeMethod'];
  const mismatch = widgetOptions.some(key => {
    const value = settings.get(key);
    if (value && value !== meta[key]) {
      Logger.warn(`Saved transaction meta does not match on key '${key}'`);
      return true;
    }
  });
  return !mismatch;
}

export function isTransactionMetaValid(settings, meta) {
  if (!validateAuthClientOptions(settings, meta)) {
    return false;
  }

  if (!validateWidgetOptions(settings, meta)) {
    return false;
  }

  return true;
}
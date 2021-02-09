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

export async function getTransactionMeta (settings) {
  const authClient = settings.getAuthClient();

  // Load existing transaction meta from storage
  if (authClient.transactionManager.exists()) {
    return authClient.transactionManager.load();
  }

  // Calculate new values
  return authClient.token.prepareTokenParams();
}

export function saveTransactionMeta (settings, meta) {
  const authClient = settings.getAuthClient();
  authClient.transactionManager.save(meta);
}

export function clearTransactionMeta (settings) {
  const authClient = settings.getAuthClient();
  authClient.transactionManager.clear();
}

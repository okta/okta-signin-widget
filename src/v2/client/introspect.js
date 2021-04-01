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

import idx from '@okta/okta-idx-js';

export async function introspect(settings, appState) {
  const domain = settings.get('baseUrl');
  const stateHandle = settings.get('stateToken');
  const version = settings.get('apiVersion');

  // For certain flows, we need to generate a device fingerprint
  // to determine if we need to send a "New Device Sign-on Notification".
  // In the future, this should be handled by okta-auth-js
  idx.client.interceptors.request.use(requestConfig => {
    const fingerprint = appState.get('deviceFingerprint');
    if (fingerprint) {
      requestConfig.headers['X-Device-Fingerprint'] = fingerprint;
    }
  });

  return idx.start({ domain, stateHandle, version });
}

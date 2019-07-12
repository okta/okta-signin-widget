/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This file could later be adapted and moved to okta-auth-js / okta-idx-js
 */
import fetch from 'cross-fetch';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-Okta-User-Agent-Extended': 'okta-idx-js'
};

const fetchRequest = (url, method, body) => {
  const fetchPromise = fetch(url, {
    method,
    headers,
    body: JSON.stringify(body),
    credentials: 'include'
  })
    .then(response => {
      const responsePromise = response.json()
        .catch(() => {
          throw 'Not a JSON';
        });
      // handle error
      if (!response.ok) {
        return responsePromise
          .then(error => {
            throw error;
          });
      } else {
        return responsePromise
          .then(resp => {
            return {
              response: resp,
              status: response.status
            };
          });
      }
    });

  return fetchPromise;
};

module.exports = { fetchRequest };

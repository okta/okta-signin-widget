/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import fetch from 'cross-fetch';

type RequestOptions = {
  url: string;
  timeout: number;
  method: 'GET' | 'POST';
  data?: string;
};

/**
* Temporary request client can be removed if this functionality is added
* to auth-js library.
* @see https://oktainc.atlassian.net/browse/OKTA-561852
* @returns Promise<Response>
*/
export const makeRequest = async ({
  url, timeout, method, data,
}: RequestOptions) => {
  // Modern browsers support AbortController, so use it
  if (window?.AbortController) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(typeof data === 'string' ? { body: data } : {}),
      signal: controller.signal,
    });

    clearTimeout(id);

    return response;
  }

  // IE11 does not support AbortController, so use an alternate
  // timeout mechanism
  const responsePromise = fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(typeof data === 'string' ? { body: data } : {}),
  });
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      reject(abortError);
    }, timeout);
  });

  return Promise.race([responsePromise, timeoutPromise]);
};
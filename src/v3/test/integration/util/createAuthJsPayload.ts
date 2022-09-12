/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

type MethodType = 'POST' | 'GET';

export const createAuthJsPayloadArgs = (
  methodType: MethodType,
  uri: string,
  data?: Record<string, unknown>,
  acceptVersion = 'application/json; okta-version=1.0.0',
  contentType = 'application/json',
): [MethodType, string, Record<string, unknown>] => {
  const payloadData = data?.interactionHandle ? data : JSON.stringify({
    ...data,
    stateHandle: (data && 'stateHandle' in data) ? data.stateHandle : 'fake-stateHandle',
  });
  const payload: Record<string, unknown> = {
    data: payloadData,
    headers: {
      Accept: acceptVersion,
      'Content-Type': contentType,
      'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
    },
    withCredentials: true,
  };
  const authJsPayload = (payload.data as Record<string, unknown>);
  if (authJsPayload.stateHandle === undefined) {
    delete authJsPayload.stateHandle;
  }

  return [methodType, `http://localhost:3000/${uri}`, payload];
};

/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

import getOktaClient from './getOktaClient';
import { Policy } from '@okta/okta-sdk-nodejs';

type Options = {
  policyName: string; 
  policyType: string;
}

export default async function fetchPolicy(options: Options) {
  const oktaClient = getOktaClient();
  const { policyType, policyName } = options;

  const policies: Policy[] = [];
  for await (const policy of await oktaClient.policyApi.listPolicies({type: policyType})) {
    if (policy) {
      policies.push(policy);
    }
  }
  const foundPolicy = policies.find(policy => policy.name === policyName);
  return foundPolicy;
}

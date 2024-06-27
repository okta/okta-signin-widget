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

import { Group, PasswordPolicy, PasswordPolicyRule } from '@okta/okta-sdk-nodejs';
import getOktaClient from './getOktaClient';
import fetchPolicy from './fetchPolicy';

export default async function(groupToAssign: Group, policyName: string): Promise<PasswordPolicy> {
  const oktaClient = getOktaClient();
  let passwordPolicy = await fetchPolicy({
    policyType: 'PASSWORD',
    policyName,
  });
  if (!passwordPolicy) {
    const passwordPolicyRequest: PasswordPolicy = {
      name: policyName,
      description: policyName,
      type: 'PASSWORD',
      status: 'ACTIVE',
      conditions: {
        people: {
          groups: {
            include: [
              groupToAssign.id as string,
            ]
          }
        }
      }
    };
    passwordPolicy = await oktaClient.policyApi.createPolicy({
      policy: passwordPolicyRequest,
      activate: true,
    });
    const policyRuleRequest: PasswordPolicyRule = {
      name: 'Deny All',
      type: 'PASSWORD',
      conditions: {
        network: {
          connection: 'ANYWHERE'
        }
      },
      actions: {
        passwordChange: {
          access: 'DENY'
        },
        selfServicePasswordReset: {
          access: 'DENY'
        },
        selfServiceUnlock: {
          access: 'DENY'
        }
      }
    };
    await oktaClient.policyApi.createPolicyRule({
      policyId: passwordPolicy.id as string,
      policyRule: policyRuleRequest,
    });

    // const defPasswordPolicy = await fetchPolicy({
    //   policyType: 'PASSWORD',
    //   policyName: 'Default Policy',
    // });
    // if (defPasswordPolicy) {
    //   const policyRuleRequest: PasswordPolicyRule = {
    //     name: 'Exclude Rule For User',
    //     type: 'PASSWORD',
    //     conditions: {
    //       network: {
    //         connection: 'ANYWHERE'
    //       },
    //       people: {
    //         users: {
    //           exclude: [
    //             user.id as string,
    //           ]
    //         }
    //       }
    //     },
    //     actions: {
    //       passwordChange: {
    //         access: 'ALLOW'
    //       },
    //       selfServicePasswordReset: {
    //         access: 'ALLOW',
    //         requirement: {
    //           primary: {
    //             methods: ['email']
    //           },
    //           stepUp: {
    //             required: false
    //           }
    //         }
    //       } as any as PasswordPolicyRuleAction,
    //       selfServiceUnlock: {
    //         access: 'ALLOW'
    //       }
    //     }
    //   };
    //   await oktaClient.policyApi.createPolicyRule({
    //     policyId: defPasswordPolicy.id as string,
    //     policyRule: policyRuleRequest,
    //   });
    // }
  }
  return passwordPolicy;
}

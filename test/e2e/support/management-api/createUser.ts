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


import { User, PasswordPolicy, PasswordPolicyRule } from '@okta/okta-sdk-nodejs';
import deleteUser from './deleteUser';
import { UserCredentials } from './createCredentials';
import getOktaClient from './getOktaClient';
import fetchGroup from './fetchGroup';
import fetchPolicy from './fetchPolicy';
import { getConfig } from '../../util/configUtil';

const userGroup = 'Basic Auth Web';

export default async (credentials: UserCredentials, assignToGroups = []): Promise<User> => {
  const config = getConfig();
  const oktaClient = getOktaClient();

  let user;

  const basicAuthGroup = {
    profile: {
      name: userGroup
    }
  };

  try {
    user = await oktaClient.userApi.createUser({
      body: {
        profile: {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          email: credentials.emailAddress,
          login: credentials.emailAddress
        },
        credentials: {
          password: { value: credentials.password }
        }
      },
      activate: true
    });

    // Dump user ID to help with local debugging
    if (process.env.LOCAL_MONOLITH) {
      const adminUrl = config.orgUrl?.replace('.okta1.com', '-admin.okta1.com');
      const userUrl = `${adminUrl}/admin/user/profile/view/${user.id}`;
      console.log('Created user: ', user.id, `${config.orgUrl}`, userUrl);
    }

    // Create the group if it doesn't exist
    let testGroup = await fetchGroup(userGroup);
    if (!testGroup) {
      testGroup = await oktaClient.groupApi.createGroup({
        group: basicAuthGroup
      });
    }
    await oktaClient.groupApi.assignUserToGroup({
      userId: user.id as string,
      groupId: testGroup.id as string,
    });

    for (const groupName of assignToGroups) {
      // TODO: create test group and attach password recovery policy during test run when API supports it
      let groupToAssign = await fetchGroup(groupName);
      if (!groupToAssign) {
        groupToAssign = await oktaClient.groupApi.createGroup({
          group: {
            profile: {
              name: groupName
            }
          }
        });
      }
      await oktaClient.groupApi.assignUserToGroup({
        userId: user.id as string,
        groupId: groupToAssign.id as string,
      });
      if (groupName === 'No Reset Password Group') {
        // const defPasswordPolicy = await fetchPolicy({
        //   policyType: 'PASSWORD',
        //   policyName: 'Default Policy',
        // });
        // if (defPasswordPolicy) {
        //   const policyRuleRequest: PasswordPolicyRule = {
        //     name: 'No Reset Password Policy Rule for 1 user',
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
      if (groupName === 'No Reset Password Group') {
        let passwordPolicy = await fetchPolicy({
          policyType: 'PASSWORD',
          policyName: 'No Reset Password Policy',
        });
        if (!passwordPolicy) {
          const passwordPolicyRequest: PasswordPolicy = {
            name: 'No Reset Password Policy',
            description: 'No Reset Password Policy',
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
            name: 'No Reset Password Policy Rule',
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
        }
      }
    }

    return user;
  } catch (err) {
    if (user) {
      await deleteUser(user);
    }
    throw err;
  }
};

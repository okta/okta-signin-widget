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


import { User, Group, PasswordPolicy } from '@okta/okta-sdk-nodejs';
import deleteUser from './deleteUser';
import { UserCredentials } from './createCredentials';
import getOktaClient from './getOktaClient';
import fetchGroup from './fetchGroup';
import getOrCreateNoResetPasswordPolicy from './getOrCreateNoResetPasswordPolicy';
import { getConfig } from '../../util/configUtil';

const userGroup = 'Basic Auth Web';

export default async (credentials: UserCredentials, assignToGroups = []): Promise<User> => {
  const config = getConfig();
  const oktaClient = getOktaClient();

  let user: User | undefined;
  let testGroup: Group | undefined;
  let groupToAssign: Group | undefined;
  let passwordPolicy: PasswordPolicy | undefined;

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
    testGroup = await fetchGroup(userGroup);
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
      groupToAssign = await fetchGroup(groupName);
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        passwordPolicy = await getOrCreateNoResetPasswordPolicy(groupToAssign, 'No Reset Password Policy');
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

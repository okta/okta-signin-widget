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


import { After, AfterStep } from '@cucumber/cucumber';
import { Client } from '@okta/okta-sdk-nodejs';
import ActionContext from '../support/context';
import deleteUserAndCredentials from '../support/management-api/deleteUserAndCredentials';
import TestAppPage from '../page-objects/test-app.page';
import { getConfig } from '../util/configUtil';

// eslint-disable-next-line no-unused-vars
AfterStep(async function (this: ActionContext) {
  this.saveScreenshot('afterStep');
});

After(deleteUserAndCredentials);

// eslint-disable-next-line no-unused-vars
After(async function(this: ActionContext) {
  if (process.env.PRESERVE_CREATED_ENTITIES) {
    console.log('Not deleting created APP:', this.app);
    console.log('Not deleting created GROUP:', this.group);
    return;
  }

  const config = getConfig();
  const oktaClient = new Client({
    orgUrl: config.orgUrl,
    token: config.oktaAPIKey,
  });

  if (this.app) {
    await oktaClient.applicationApi.deactivateApplication({ appId: this.app.id as string });
    await oktaClient.applicationApi.deleteApplication({ appId: this.app.id as string });
  }
  if (this.group) {
    await oktaClient.groupApi.deleteGroup({ groupId: this.group.id as string });
  }
});

After(() => browser.deleteCookies());

// eslint-disable-next-line no-unused-vars
After(async function(this: ActionContext) {
  await TestAppPage.ssoLogout();
});


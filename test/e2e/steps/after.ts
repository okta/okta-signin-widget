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
import ActionContext from '../support/context';
import deleteUserAndCredentials from '../support/management-api/deleteUserAndCredentials';
import deleteApp from '../support/management-api/deleteApp';
import deleteGroup from '../support/management-api/deleteGroup';
import TestAppPage from '../page-objects/test-app.page';

// eslint-disable-next-line no-unused-vars
AfterStep(async function (this: ActionContext) {
  await this.saveScreenshot('afterStep');
});

After(deleteUserAndCredentials);

// eslint-disable-next-line no-unused-vars
After(async function(this: ActionContext) {
  if (process.env.PRESERVE_CREATED_ENTITIES) {
    console.log('Not deleting created APP:', this.app);
    console.log('Not deleting created GROUP:', this.group);
    return;
  }

  if (this.app) {
    await deleteApp(this.app);
  }
  if (this.group) {
    await deleteGroup(this.group);
  }
});

// eslint-disable-next-line no-unused-vars
After(async function(this: ActionContext) {
  if (this.scenario?.gherkinDocument?.feature?.name !== 'Widget Flows') {
    await TestAppPage.ssoLogout();
    await this.saveScreenshot('ssoLogout');
  }
});

After(async () => {
  await browser.deleteCookies();
});

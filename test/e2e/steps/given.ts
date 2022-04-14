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


import { Given } from '@cucumber/cucumber';

import createContextUserAndCredentials from '../support/management-api/createContextUserAndCredentials';
import ActionContext from '../support/context';
import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';

const {
  WIDGET_TEST_SERVER,
  WIDGET_SPA_CLIENT_ID,
} = process.env;
const config = {
  baseUrl: WIDGET_TEST_SERVER,
  redirectUri: 'http://localhost:3000/done',
  el: '#okta-login-container',
  clientId: WIDGET_SPA_CLIENT_ID,
  useInteractionCodeFlow: true,
  scopes: ['openid', 'email', 'profile']
};

Given(
  /^an App configured to use interaction code flow$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    // eslint-disable-next-line max-len
    console.log(JSON.stringify(config)); // for manual testing in browser
    await TestAppPage.open();
    return await TestAppPage.setConfig(config);
  }
);

Given(
  /^a User named "([^/w]+)" exists in the org$/,
  async function(this: ActionContext, firstName: string) {
    await createContextUserAndCredentials.call(this, firstName);
  }
);

Given(
  /^user opens the login page$/,
  async function() {
    await TestAppPage.startButton.click();
    return await waitForLoad(TestAppPage.widget);
  }
);

Given(
  /^user opens the login page using renderEl$/,
  async function() {
    await TestAppPage.startWithRenderEl.click();
    return await waitForLoad(TestAppPage.widget);
  }
);

Given(
  /^state parameter is set in the widget config$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    const config = {
      baseUrl: WIDGET_TEST_SERVER,
      redirectUri: 'http://localhost:3000/done',
      el: '#okta-login-container',
      clientId: WIDGET_SPA_CLIENT_ID,
      useInteractionCodeFlow: true,
      scopes: ['openid', 'email', 'profile'],
      state: 'abc'
    };
    return await TestAppPage.setConfig(config);
  }
);

Given(
  /^user opens the widget in "(\w+)" flow config$/,
  async function(flow: string) {
    await TestAppPage.flowDropdown.selectByVisibleText(flow);
    return await TestAppPage.startButton.click();
  }
);


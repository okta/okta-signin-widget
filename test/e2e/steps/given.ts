/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

import ActionContext from '../support/context';
import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';
import A18nClient from '../support/a18nClient';
import createCredentials from '../support/management-api/createCredentials'
import createUser from '../support/management-api/createUser'
import createApp from '../support/management-api/createApp'
import createGroup from '../support/management-api/createGroup';
import assignAppToGroup from '../support/management-api/assignAppToGroup';


let MonolithClient: any;
if (process.env.LOCAL_MONOLITH) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MonolithClient = require('../support/monolith/monolithClient').MonolithClient;
}

const {
  WIDGET_TEST_SERVER,
  WIDGET_SPA_CLIENT_ID,
  WIDGET_WEB_CLIENT_ID,
} = process.env;

const interactionCodeFlowconfig = {
  baseUrl: WIDGET_TEST_SERVER,
  redirectUri: 'http://localhost:3000/done',
  el: '#okta-login-container',
  clientId: WIDGET_SPA_CLIENT_ID,
  useInteractionCodeFlow: true,
  scopes: ['openid', 'email', 'profile']
};

const basicConfig = {
  baseUrl: WIDGET_TEST_SERVER,
  redirectUri: 'http://localhost:3000/done',
  el: '#okta-login-container',
  authParams: { pkce: false },
  clientId: WIDGET_WEB_CLIENT_ID,
  scopes: ['openid', 'email', 'profile']
};

Given(
  /^an App configured to use interaction code flow$/,
  // eslint-disable-next-line no-unused-vars
  async function (this: ActionContext) {
    // eslint-disable-next-line max-len
    console.log(JSON.stringify(interactionCodeFlowconfig)); // for manual testing in browser
    await TestAppPage.open();
    return await TestAppPage.setConfig(interactionCodeFlowconfig);
  }
);

Given(
  /^an App ("[\w\s]+")?\s? configured to use v1 authn flow$/,
  // eslint-disable-next-line no-unused-vars
  async function (this: ActionContext, appName?: string) {
    const config = { ...basicConfig };
    console.log(JSON.stringify(config)); // for manual testing in browser
    if (appName) {
      if (process.env.LOCAL_MONOLITH) {
        // this.monolithClient = new MonolithClient();
        // this.app = await this.monolithClient!.createApplication();
      } else {
        this.app = await createApp({ appType: 'browser' });
        config.clientId = this.app.id;
      }
    }
    await TestAppPage.open();
    return await TestAppPage.setConfig(config);
  }
);

Given(
  /^a group ("[\w\s]+") is assigned to this app$/,
  // eslint-disable-next-line no-unused-vars
  async function (this: ActionContext, groupName: string) {
    if (process.env.LOCAL_MONOLITH) {
      // this.monolithClient = new MonolithClient();
      // this.app = await this.monolithClient!.createGroup();
    } else {
      this.group = await createGroup(groupName);
      assignAppToGroup(this.app.id, this.group.id)
    }
  }
);

Given(
  /^a User named "([^/w]+)" exists in the org$/,
  async function (this: ActionContext, firstName: string) {
    if (process.env.LOCAL_MONOLITH) {
      this.monolithClient = new MonolithClient();
      this.credentials = await this.monolithClient!.createCredentials(firstName);
    } else {
      this.a18nClient = new A18nClient();
      this.credentials = await createCredentials(this.a18nClient, firstName);
    }
    this.user = await createUser(this.credentials);
  }
);

Given(
  /^an a18n profile exists$/,
  async function () {
    if (process.env.LOCAL_MONOLITH) {
      this.monolithClient = new MonolithClient();
      this.credentials = await this.monolithClient.createCredentials('test');
    } else {
      this.a18nClient = new A18nClient();
      this.credentials = await createCredentials(this.a18nClient, "test");
    }
  }
);

Given(
  /^a User named "([^/w]+)" exists in the org and added to "([^/w]+)" group$/,
  async function (this: ActionContext, firstName: string, groupName: string) {
    if (process.env.LOCAL_MONOLITH) {
      this.monolithClient = new MonolithClient();
      this.credentials = await this.monolithClient!.createCredentials(firstName);
    } else {
      this.a18nClient = new A18nClient();
      this.credentials = await createCredentials(this.a18nClient, firstName);
    }
    this.user = await createUser(this.credentials, [groupName] as never[]);
  }
);

Given(
  /^user opens the login page$/,
  async function () {
    await TestAppPage.startButton.click();
    return await waitForLoad(TestAppPage.widget);
  }
);

Given(
  /^user opens the login page using "(\w+)"$/,
  async function (this: ActionContext, buttonName: string) {
    switch (buttonName) {
      case 'renderEl':
        await TestAppPage.startWithRenderEl.click();
        break;

      case 'showSignIn':
        await TestAppPage.showSignInButton.click();
        break;

      case 'showSignInAndRedirect':
        await TestAppPage.showSignInAndRedirect.click();
        break;

      case 'showSignInToGetTokens':
        await TestAppPage.showSignInToGetTokens.click();
        break;
    }
    this.saveScreenshot(`user-opens-login-page-using-${buttonName}`);
    return await waitForLoad(TestAppPage.widget);
  }
);


Given(
  /^state parameter is set in the widget config$/,
  // eslint-disable-next-line no-unused-vars
  async function (this: ActionContext) {
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
  async function (flow: string) {
    await TestAppPage.flowDropdown.selectByVisibleText(flow);
    return await TestAppPage.startButton.click();
  }
);

Given(
  /^widget config is updated with colors and i18n$/,
  async function () {
    const config = {
      ...interactionCodeFlowconfig,
      colors: {
        brand: '#008000'
      },
      i18n: {
        en: {
          'primaryauth.title': 'Sign In to Acme'
        }
      }
    };

    await TestAppPage.setConfig(config);
    await TestAppPage.startButton.click();
    await waitForLoad(TestAppPage.widget);
  }
);






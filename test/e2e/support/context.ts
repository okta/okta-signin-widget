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


import { Application, Group, User } from '@okta/okta-sdk-nodejs';
import { ITestCaseHookParameter } from '@cucumber/cucumber'
import { UserCredentials } from '../support/management-api/createCredentials';
import { A18nConfig } from './a18nClient';
import A18nClient from './a18nClient';

// eslint-disable-next-line no-unused-vars
declare type SaveScreenshotFunction = (fileName?: string) => Promise<void>;

interface ActionContext {
  credentials: UserCredentials;
  user: User;
  app: Application;
  group: Group;
  userName?: string;
  config: A18nConfig;
  a18nClient?: A18nClient;
  monolithClient?: any; // cannot use type from private module here
  scenario?: ITestCaseHookParameter;
  saveScreenshot: SaveScreenshotFunction;
}

export default ActionContext;

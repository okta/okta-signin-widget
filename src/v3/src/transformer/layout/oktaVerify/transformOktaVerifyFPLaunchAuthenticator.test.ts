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

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  DescriptionElement, LaunchAuthenticatorButtonElement, TitleElement, WidgetProps,
} from '../../../types';
import { transformOktaVerifyFPLaunchAuthenticator } from './transformOktaVerifyFPLaunchAuthenticator';

describe('Launch Authenticator page transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    widgetProps = {};
  });

  it('should create Launch Authenticator button, title, and description elements for display', () => {
    const updatedFormBag = transformOktaVerifyFPLaunchAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type)
      .toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type)
      .toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oktaVerify.description');
    expect((updatedFormBag.uischema.elements[2] as LaunchAuthenticatorButtonElement).type)
      .toBe('LaunchAuthenticatorButton');
    expect((updatedFormBag.uischema.elements[2] as LaunchAuthenticatorButtonElement).label)
      .toBe('oktaVerify.button');
  });

  it('should show correct description when app is specified', () => {
    transaction.context.app.value.label = 'test app';
    const updatedFormBag = transformOktaVerifyFPLaunchAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });

    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oktaVerify.appDescription');
  });
});

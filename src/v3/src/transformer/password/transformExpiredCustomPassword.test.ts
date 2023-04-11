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
  ButtonElement,
  ButtonType,
  DescriptionElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformExpiredCustomPassword } from './transformExpiredCustomPassword';

describe('ReEnroll Custom password expiry Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      ...transaction.nextStep,
      // @ts-expect-error OKTA-598703 - customExpiredPasswordName does not exist in NextStep type
      customExpiredPasswordName: 'password reset website name',
      customExpiredPasswordURL: 'http://testhost.com/test-page.html',
    };

    widgetProps = {};
  });

  it('should add correct title, subtitle, and button', () => {
    const updatedFormBag = transformExpiredCustomPassword({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.expired.title.generic');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).contentType).toBe('subtitle');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('password.expired.custom.subtitle');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type)
      .toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.BUTTON);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('password.expired.custom.submit');
  });
});

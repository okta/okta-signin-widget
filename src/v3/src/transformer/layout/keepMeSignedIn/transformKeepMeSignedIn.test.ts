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
  DescriptionElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformKeepMeSignedIn } from '.';

describe('transformKeepMeSignedIn Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: 'keep-me-signed-in',
      action: jest.fn(),
    };
  });

  it('should create keep me signed in elements with valid response', () => {
    const updatedFormBag = transformKeepMeSignedIn({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content).toBe('oie.kmsi.title');

    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content).toBe('oie.kmsi.subtitle');

    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe('oie.kmsi.accept');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label).toBe('oie.kmsi.reject');
  });
});

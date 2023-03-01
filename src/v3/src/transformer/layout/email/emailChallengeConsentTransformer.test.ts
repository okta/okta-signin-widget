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
  FieldElement,
  ImageWithTextElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformEmailChallengeConsent } from '.';

describe('EmailChallengeConsentTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag('email-challenge-consent');

  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'consent' } } } as FieldElement,
    ];
    transaction.nextStep = {
      name: 'email-challenge-consent',
      action: jest.fn(),
      // @ts-ignore requestInfo missing from NextStep interface
      requestInfo: [{
        name: 'appName',
        value: 'Okta Dashboard',
      }, {
        name: 'browser',
        value: 'CHROME',
      }],
    };
  });

  it('should create email consent ui elements with valid response', () => {
    const updatedFormBag = transformEmailChallengeConsent({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content).toBe('oie.consent.enduser.title');
    expect((updatedFormBag.uischema.elements[1] as ImageWithTextElement).type).toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[1] as ImageWithTextElement).options.id).toBe('browser');
    expect((updatedFormBag.uischema.elements[1] as ImageWithTextElement).options?.textContent).toBe('CHROME');

    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).type).toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options.id).toBe('appName');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options?.textContent).toBe('Okta Dashboard');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.actionParams?.consent)
      .toBe(false);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.consent.enduser.deny.label');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.dataType).toBe('cancel');

    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.actionParams?.consent)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.dataType).toBe('save');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.consent.enduser.accept.label');
  });
});

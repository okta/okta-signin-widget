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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformSecurityQuestionVerify } from '.';

describe('SecurityQuestionVerify Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [{
      type: 'Field',
      options: { inputMeta: { name: 'credentials.answer', secret: true } },
    } as FieldElement];
  });

  it('should create security question verify UI elements', () => {
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            question: 'What is the food you least liked as a child?',
            questionKey: 'disliked_food',
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionVerify({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.security.question.challenge.title');

    // answer element
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.answer');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).noTranslate)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations?.[0])
      .toEqual({
        i18nKey: '',
        name: 'label',
        value: 'security.disliked_food',
      });

    // submit button
    expect(updatedFormBag.uischema.elements[2].type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe('oform.verify');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create security question verify UI elements for custom question', () => {
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            question: 'What is love?',
            questionKey: 'custom',
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionVerify({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.security.question.challenge.title');

    // answer element
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.answer');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.secret)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).noTranslate)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).translations?.[0])
      .toEqual({
        i18nKey: '',
        name: 'label',
        value: 'What is love?',
      });

    // submit button
    expect(updatedFormBag.uischema.elements[2].type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe('oform.verify');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});

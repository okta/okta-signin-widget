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
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement, FormBag, ImageWithTextElement,
  ReminderElement, TitleElement, UISchemaLayoutType, WidgetProps,
} from 'src/types';

import { transformOktaVerifyChallengePoll } from './transformOktaVerifyChallengePoll';

describe('Transform Okta Verify Challenge Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  const mockProps: WidgetProps = {};

  beforeEach(() => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
        } as IdxAuthenticator,
      },
    };
    formBag = {
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };
  });

  it('should not update formBag when there are no selected authenticator methods', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [],
        } as unknown as IdxAuthenticator,
      },
    };
    expect(transformOktaVerifyChallengePoll(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should not update formBag when selected authenticator method is unrecognized', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'fake' }],
        } as IdxAuthenticator,
      },
    };
    expect(transformOktaVerifyChallengePoll(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should transform elements when method type is standard push only', () => {
    const updatedFormBag = transformOktaVerifyChallengePoll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.okta_verify.push.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Reminder');
    expect((updatedFormBag.uischema.elements[1] as ReminderElement).options?.ctaText)
      .toBe('oktaverify.warning');
    expect((updatedFormBag.uischema.elements[1] as ReminderElement).options?.excludeLink)
      .toBe(true);
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.okta_verify.push.sent');
    expect(updatedFormBag.uischema.elements[3].type).toBe('Spinner');
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security with resend avaialable', () => {
    const correctAnswer = '42';
    transaction.nextStep = {
      ...transaction.nextStep,
      canResend: true,
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          contextualData: {
            // @ts-ignore OKTA-496373 correctAnswer is missing from interface
            correctAnswer,
          },
        },
      },
    };
    const updatedFormBag = transformOktaVerifyChallengePoll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Reminder');
    expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.ctaText)
      .toBe('next.numberchallenge.warning');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[1] as TitleElement).options?.content)
      .toBe('oie.okta_verify.push.sent');
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('next.numberchallenge.instruction');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.contentParams)
      .toEqual([correctAnswer]);
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).type)
      .toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).options?.textContent)
      .toBe(correctAnswer);
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).options?.SVGIcon)
      .not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[4].type).toBe('Spinner');
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security when resend is unavailable', () => {
    const correctAnswer = '42';
    transaction.nextStep = {
      ...transaction.nextStep,
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          contextualData: {
            // @ts-ignore OKTA-496373 correctAnswer is missing from interface
            correctAnswer,
          },
        },
      },
    };
    const updatedFormBag = transformOktaVerifyChallengePoll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.okta_verify.push.sent');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('next.numberchallenge.instruction');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.contentParams)
      .toEqual([correctAnswer]);
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).type)
      .toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options?.textContent)
      .toBe(correctAnswer);
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options?.SVGIcon)
      .not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[3].type).toBe('Spinner');
  });
});

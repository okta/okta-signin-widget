/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement,
  ImageWithTextElement,
  ReminderElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformOktaVerifyDeviceChallengePoll } from '../layout/oktaVerify/transformOktaVerifyDeviceChallengePoll';
import { transformOktaVerifyFPLoopbackPoll } from '../layout/oktaVerify/transformOktaVerifyFPLoopbackPoll';
import { transformOktaVerifyChallengePoll } from './transformOktaVerifyChallengePoll';

jest.mock('../layout/oktaVerify/transformOktaVerifyDeviceChallengePoll');
jest.mock('../layout/oktaVerify/transformOktaVerifyFPLoopbackPoll');

describe('Transform Okta Verify Challenge Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
        } as IdxAuthenticator,
      },
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
    expect(transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
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
    expect(transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should transform elements when method type is standard push only', () => {
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.okta_verify.push.title');
    expect((updatedFormBag.uischema.elements[1] as ReminderElement).options.content)
      .toBe('oktaverify.warning');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.okta_verify.push.sent');
    expect(updatedFormBag.uischema.elements[3].type).toBe('Spinner');
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security with resend avaialable', () => {
    transaction.availableSteps = [{ name: 'resend' }];
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
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as ReminderElement).options.content)
      .toBe('oie.numberchallenge.warning');
    expect((updatedFormBag.uischema.elements[0] as ReminderElement).options.isActionStep)
      .toBe(true);
    expect((updatedFormBag.uischema.elements[0] as ReminderElement).options.step)
      .toBe('resend');
    expect((updatedFormBag.uischema.elements[1] as TitleElement).options.content)
      .toBe('oie.okta_verify.push.sent');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.numberchallenge.instruction');
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).type)
      .toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).options.textContent)
      .toBe('42');
    expect((updatedFormBag.uischema.elements[3] as ImageWithTextElement).options.id).toBe('code');
    expect(updatedFormBag.uischema.elements[4].type).toBe('Spinner');
  });

  it('should transform elements when method type is push and '
    + 'has enhanced security when resend is unavailable', () => {
    transaction.availableSteps = [];
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
    const updatedFormBag = transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.okta_verify.push.sent');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.numberchallenge.instruction');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).type)
      .toBe('ImageWithText');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options.textContent)
      .toBe('42');
    expect((updatedFormBag.uischema.elements[2] as ImageWithTextElement).options.id).toBe('code');
    expect(updatedFormBag.uischema.elements[3].type).toBe('Spinner');
  });

  it('should call device challenge poll transformer when selected authenticator method is signed_nonce', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'signed_nonce' }],
        } as IdxAuthenticator,
      },
    };

    transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(transformOktaVerifyDeviceChallengePoll).toHaveBeenCalledTimes(1);
    expect(transformOktaVerifyDeviceChallengePoll).toHaveBeenLastCalledWith({
      transaction,
      formBag,
      widgetProps,
    });
  });

  it('should call FP loopback poll transformer when selected authenticator method is signed_nonce AND challengeMethod is loopback', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'signed_nonce' }],
          contextualData: {
            // @ts-expect-error challenge is not on contextualData
            challenge: {
              value: {
                challengeMethod: 'LOOPBACK',
              },
            },
          },
        },
      },
    };

    transformOktaVerifyChallengePoll({ transaction, formBag, widgetProps });

    expect(transformOktaVerifyFPLoopbackPoll).toHaveBeenCalledTimes(1);
    expect(transformOktaVerifyFPLoopbackPoll).toHaveBeenLastCalledWith({
      transaction,
      formBag,
      widgetProps,
    });
  });
});

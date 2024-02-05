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
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  ReminderElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as locUtils from '../../util/locUtil';
import { transformPhoneChallenge } from '.';

describe('PhoneChallengeTransformer Tests', () => {
  const redactedPhone = '+1 XXX-XXX-4601';
  const mockNickname = 'ph-nn';
  const transaction = getStubTransactionWithNextStep(IDX_STEP.CHALLENGE_AUTHENTICATOR);
  const widgetProps: WidgetProps = {} as unknown as WidgetProps;
  const formBag = getStubFormBag();
  beforeEach(() => {
    transaction.availableSteps = [];
    formBag.uischema.elements = [];
  });

  it('should create SMS challenge UI elements when resend code is available', () => {
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as ReminderElement).options.content)
      .toBe('oie.phone.verify.sms.resendText');
    expect((updatedFormBag.uischema.elements[1] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.sms.codeSentText.with.phone.without.nickname';
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${redactedPhone}`],
      { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
    );

    expect(updatedFormBag.uischema.elements[3].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create SMS challenge UI elements when resend code is NOT available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.sms.codeSentText.with.phone.without.nickname';
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${redactedPhone}`],
      { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
    );

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create SMS challenge UI elements when phone number and nickname are available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          nickname: mockNickname,
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.sms.codeSentText.with.phone.with.nickname';
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${redactedPhone}`, mockNickname],
      {
        $1: { element: 'span', attributes: { class: 'strong no-translate' } },
        $2: {
          element: 'span',
          attributes: { class: 'strong no-translate authenticator-verify-nickname' },
        },
      },
    );

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create SMS challenge UI elements when phone number not available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.phone.verify.sms.codeSentText.without.phone');

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create voice challenge UI elements when phoneNumber not available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          methods: [{ type: 'voice' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.phone.verify.mfa.calling.without.phone');

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create voice challenge UI elements when phoneNumber is available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'voice' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.mfa.calling.with.phone.without.nickname';
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${redactedPhone}`],
      { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
    );

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create voice challenge UI elements when phoneNumber and nickname are available', () => {
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          nickname: mockNickname,
          methods: [{ type: 'voice' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneChallenge({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.mfa.calling.with.phone.with.nickname';
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${redactedPhone}`, mockNickname],
      {
        $1: { element: 'span', attributes: { class: 'strong no-translate' } },
        $2: {
          element: 'span',
          attributes: { class: 'strong no-translate authenticator-verify-nickname' },
        },
      },
    );

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});

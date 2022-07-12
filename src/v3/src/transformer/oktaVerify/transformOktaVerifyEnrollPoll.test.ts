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

import { IdxContext } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement,
  FormBag,
  ListElement,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import * as utils from '../../util/browserUtils';
import * as channelTransformer from './transformOktaVerifyChannelSelection';
import { transformOktaVerifyEnrollPoll } from './transformOktaVerifyEnrollPoll';

describe('TransformOktaVerifyEnrollPoll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let channelSelectFormBag: FormBag;
  let mobileDeviceStub: jest.SpyInstance<boolean>;
  let channelTransformerStub: jest.SpyInstance;
  let mockProps: WidgetProps;

  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };

    channelSelectFormBag = {
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [{ type: 'Title', options: { content: 'Select a channel' } } as TitleElement],
      },
      data: {},
    };

    mobileDeviceStub = jest.spyOn(utils, 'isAndroidOrIOS');
    channelTransformerStub = jest.spyOn(
      channelTransformer,
      'transformOktaVerifyChannelSelection',
    ).mockReturnValue(channelSelectFormBag);
    mockProps = {};
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return a channel selection formBag when mobile device and qrcode is selected channel', () => {
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: { selectedChannel: 'qrcode' },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    expect(updatedFormBag).toStrictEqual(channelSelectFormBag);

    expect(mobileDeviceStub).toBeCalledTimes(1);
    expect(channelTransformerStub).toBeCalledTimes(1);
    mobileDeviceStub.mockRestore();
    channelTransformerStub.mockRestore();
  });

  it('should return a channel selection formBag when on mobile device and sms is selected channel with canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'sms',
            phoneNumber: '+14215551262',
          },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements.length,
    ).toBe(4);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout)
        .elements[0] as UISchemaLayout)
        .elements[0] as ReminderElement).options?.ctaText,
    ).toBe('next.enroll.okta_verify.sms.notReceived');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[1] as TitleElement).options?.content,
    ).toBe('oie.enroll.okta_verify.setup.sms.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.content,
    ).toBe('next.enroll.okta_verify.sms.info');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.contentParams,
    ).toEqual(['+14215551262']);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(1);

    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements.length,
    ).toBe(1);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('Select a channel');
  });

  it('should return a channel selection formBag when on mobile device and email is selected channel and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'email',
            email: 'noreply@noemail.com',
          },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements.length,
    ).toBe(4);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[0] as ReminderElement).options?.ctaText,
    ).toBe('next.enroll.okta_verify.email.notReceived');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[1] as TitleElement).options?.content,
    ).toBe('oie.enroll.okta_verify.setup.email.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.content,
    ).toBe('next.enroll.okta_verify.email.info');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.contentParams,
    ).toEqual(['noreply@noemail.com']);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(1);

    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements.length,
    ).toBe(1);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('Select a channel');
  });

  it('should add Stepper elements when selectedChannel is qrcode and not on mobile device and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'qrcode',
            qrcode: { href: '', method: '', type: '' },
          },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements.length,
    ).toBe(4);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('oie.enroll.okta_verify.setup.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[1] as ListElement).options?.items,
    ).toEqual([
      'oie.enroll.okta_verify.qrcode.step1',
      'oie.enroll.okta_verify.qrcode.step2',
      'oie.enroll.okta_verify.qrcode.step3',
    ]);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2].type,
    ).toBe('QRCode');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).label,
    ).toBe('enroll.totp.cannotScan');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(1);

    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements.length,
    ).toBe(2);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('Select a channel');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[1] as StepperButtonElement).label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[1] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[1] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(0);
  });

  it('should add Stepper elements when selectedChannel is sms and not on mobile device and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'sms',
            phoneNumber: '+14215551262',
          },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements.length,
    ).toBe(4);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[0] as ReminderElement).options?.ctaText,
    ).toBe('next.enroll.okta_verify.sms.notReceived');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[1] as TitleElement).options?.content,
    ).toBe('oie.enroll.okta_verify.setup.sms.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.content,
    ).toBe('next.enroll.okta_verify.sms.info');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.contentParams,
    ).toEqual(['+14215551262']);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(1);

    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements.length,
    ).toBe(1);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('Select a channel');
  });

  it('should add Stepper elements when selectedChannel is email and not on mobile device and canResend = true', () => {
    transaction.availableSteps = [{ name: 'resend' }];
    transaction.nextStep = {
      name: '',
      canResend: true,
    };
    transaction.context = {
      // TODO: OKTA-503490 temporary sln access missing relatesTo obj
      currentAuthenticator: {
        value: {
          contextualData: {
            selectedChannel: 'email',
            email: 'noreply@noemail.com',
          },
        },
      },
    } as unknown as IdxContext;
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements.length,
    ).toBe(4);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[0] as ReminderElement).options?.ctaText,
    ).toBe('next.enroll.okta_verify.email.notReceived');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[1] as TitleElement).options?.content,
    ).toBe('oie.enroll.okta_verify.setup.email.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.content,
    ).toBe('next.enroll.okta_verify.email.info');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[2] as DescriptionElement).options?.contentParams,
    ).toEqual(['noreply@noemail.com']);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.variant,
    ).toBe('secondary');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as UISchemaLayout)
        .elements[3] as StepperButtonElement).options?.nextStepIndex,
    ).toBe(1);

    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements.length,
    ).toBe(1);
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as UISchemaLayout)
        .elements[0] as TitleElement).options?.content,
    ).toBe('Select a channel');
  });
});

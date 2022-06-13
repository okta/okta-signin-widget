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

import { Layout } from '@jsonforms/core';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, StepperLayout, WidgetProps } from 'src/types';

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
        type: 'VerticalLayout',
        elements: [],
      },
    };

    channelSelectFormBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [{ type: 'Title', options: { content: 'Select a channel' } }],
      },
    };

    mobileDeviceStub = jest.spyOn(utils, 'isAndroidOrIOS');
    channelTransformerStub = jest.spyOn(
      channelTransformer,
      'transformOktaVerifyChannelSelection',
    ).mockReturnValue(channelSelectFormBag);
    mockProps = {};
  });

  it('should return a channel selection formBag when mobile device and qrcode is selected channel', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: { selectedChannel: 'qrcode' },
      },
    };
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    expect(updatedFormBag).toStrictEqual(channelSelectFormBag);

    expect(mobileDeviceStub).toBeCalledTimes(1);
    expect(channelTransformerStub).toBeCalledTimes(1);
    mobileDeviceStub.mockRestore();
    channelTransformerStub.mockRestore();
  });

  it('should return a channel selection formBag when mobile device and sms is selected channel', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: {
          selectedChannel: 'sms',
          // @ts-ignore OKTA-496373 - missing props from interface
          phoneNumber: '+14215551262',
        },
      },
    };
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(3);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.ctaText,
    ).toBe('next.enroll.okta_verify.sms.notReceived');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1].options?.content,
    ).toBe('oie.enroll.okta_verify.setup.sms.title');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('next.enroll.okta_verify.sms.info');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.contentParams,
    ).toEqual(['+14215551262']);
    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements.length,
    ).toBe(1);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements[0].options?.content,
    ).toBe('Select a channel');
    // Check stepper button config options
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).options?.key),
    ).toBeDefined();
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.next.label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
  });

  it('should return a channel selection formBag when mobile device and email is selected channel', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: {
          selectedChannel: 'email',
          // @ts-ignore OKTA-496373 - missing props from interface
          email: 'noreply@noemail.com',
        },
      },
    };
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(3);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.ctaText,
    ).toBe('next.enroll.okta_verify.email.notReceived');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1].options?.content,
    ).toBe('oie.enroll.okta_verify.setup.email.title');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('next.enroll.okta_verify.email.info');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.contentParams,
    ).toEqual(['noreply@noemail.com']);
    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements.length,
    ).toBe(1);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements[0].options?.content,
    ).toBe('Select a channel');
    // Check stepper button config options
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).options?.key),
    ).toBeDefined();
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.next.label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
  });

  it('should add Stepper elements when selectedChannel is qrcode and not on mobile device', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: {
          selectedChannel: 'qrcode',
          qrcode: { href: '', method: '', type: '' },
        },
      },
    };
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(3);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.content,
    ).toBe('oie.enroll.okta_verify.setup.title');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1].options?.items,
    ).toEqual([
      'oie.enroll.okta_verify.qrcode.step1',
      'oie.enroll.okta_verify.qrcode.step2',
      'oie.enroll.okta_verify.qrcode.step3',
    ]);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].type,
    ).toBe('QRCode');
    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements.length,
    ).toBe(1);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements[0].options?.content,
    ).toBe('Select a channel');
    // Check stepper button config options
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).options?.key),
    ).toBeDefined();
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.next.label,
    ).toBe('enroll.totp.cannotScan');
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.prev.label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
  });

  it('should add Stepper elements when selectedChannel is sms and not on mobile device', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: {
          selectedChannel: 'sms',
          // @ts-ignore OKTA-496373 - missing props from interface
          phoneNumber: '+14215551262',
        },
      },
    };
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(3);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.ctaText,
    ).toBe('next.enroll.okta_verify.sms.notReceived');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1].options?.content,
    ).toBe('oie.enroll.okta_verify.setup.sms.title');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('next.enroll.okta_verify.sms.info');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.contentParams,
    ).toEqual(['+14215551262']);
    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements.length,
    ).toBe(1);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements[0].options?.content,
    ).toBe('Select a channel');
    // Check stepper button config options
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).options?.key),
    ).toBeDefined();
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.next.label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
  });

  it('should add Stepper elements when selectedChannel is email and not on mobile device', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: {
          selectedChannel: 'email',
          // @ts-ignore OKTA-496373 - missing props from interface
          email: 'noreply@noemail.com',
        },
      },
    };
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyEnrollPoll(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(3);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.ctaText,
    ).toBe('next.enroll.okta_verify.email.notReceived');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1].options?.content,
    ).toBe('oie.enroll.okta_verify.setup.email.title');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('next.enroll.okta_verify.email.info');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.contentParams,
    ).toEqual(['noreply@noemail.com']);
    // Second step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements.length,
    ).toBe(1);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[1] as Layout)
        .elements[0].options?.content,
    ).toBe('Select a channel');
    // Check stepper button config options
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).options?.key),
    ).toBeDefined();
    expect(
      (updatedFormBag.uischema.elements[0] as StepperLayout)
        .options?.navButtonsConfig.next.label,
    ).toBe('next.enroll.okta_verify.switch.channel.link.text');
  });
});

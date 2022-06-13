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

import { ControlElement } from '@jsonforms/core';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import * as utils from '../../util/browserUtils';
import * as stepTransformer from '../step/index';
import { transformOktaVerifyChannelSelection } from './transformOktaVerifyChannelSelection';

describe('TransformOktaVerifyChannelSelection Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  let mobileDeviceStub: jest.SpyInstance<boolean>;
  let stepTransformerStub: jest.SpyInstance;

  beforeEach(() => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_ENROLLMENT_CHANNEL,
      options: [
        { label: 'QRCode', value: 'qrcode' },
        { label: 'SMS', value: 'sms' },
        { label: 'EMAIL', value: 'email' },
      ],
    }];
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/authenticator/properties/id',
          } as ControlElement,
          {
            type: 'Control',
            scope: '#/properties/authenticator/properties/channel',
          } as ControlElement,
        ],
      },
    };

    mobileDeviceStub = jest.spyOn(utils, 'isAndroidOrIOS');
    stepTransformerStub = jest.spyOn(
      stepTransformer,
      'transformStep',
    ).mockReturnValue(formBag);
  });

  afterEach(() => {
    stepTransformerStub.mockReset();
  });

  it('should only append (sms/email) channel options when on mobile and qrcode is the selectedChannel', () => {
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

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content).toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'sms', value: 'oie.enroll.okta_verify.select.channel.sms.label' },
        { key: 'email', value: 'oie.enroll.okta_verify.select.channel.email.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });

  it('should only append (sms/email) channel options when on mobile and sms is the selectedChannel', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: { selectedChannel: 'sms' },
      },
    };
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content).toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'sms', value: 'oie.enroll.okta_verify.select.channel.sms.label' },
        { key: 'email', value: 'oie.enroll.okta_verify.select.channel.email.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });

  it('should only append (sms/email) channel options when on mobile and email is the selectedChannel', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: { selectedChannel: 'email' },
      },
    };
    mobileDeviceStub.mockReturnValue(true);

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content).toBe('oie.enroll.okta_verify.setup.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'sms', value: 'oie.enroll.okta_verify.select.channel.sms.label' },
        { key: 'email', value: 'oie.enroll.okta_verify.select.channel.email.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });

  it('should only append (qrcode/email) channel options when NOT on mobile and sms is the selectedChannel', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: { selectedChannel: 'sms' },
      },
    };
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'qrcode', value: 'oie.enroll.okta_verify.select.channel.qrcode.label' },
        { key: 'email', value: 'oie.enroll.okta_verify.select.channel.email.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });

  it('should only append (qrcode/sms) channel options when NOT on mobile and email is the selectedChannel', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [],
        contextualData: { selectedChannel: 'email' },
      },
    };
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.enroll.okta_verify.select.channel.description');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'qrcode', value: 'oie.enroll.okta_verify.select.channel.qrcode.label' },
        { key: 'sms', value: 'oie.enroll.okta_verify.select.channel.sms.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });

  it('should only append (sms/email) channel options when NOT on mobile and qrcode is the selectedChannel', () => {
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
    mobileDeviceStub.mockReturnValue(false);

    const updatedFormBag = transformOktaVerifyChannelSelection(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.enroll.okta_verify.select.channel.title');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/id');
    expect(updatedFormBag.uischema.elements[1].options?.type).toBe('hidden');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator/properties/channel');
    expect(updatedFormBag.uischema.elements[2].options?.optionalLabel).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.choices?.length).toBe(2);
    expect(updatedFormBag.uischema.elements[2].options?.choices)
      .toEqual([
        { key: 'sms', value: 'oie.enroll.okta_verify.select.channel.sms.label' },
        { key: 'email', value: 'oie.enroll.okta_verify.select.channel.email.label' },
      ]);
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('oform.next');
  });
});

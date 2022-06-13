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

import { ControlElement, Layout } from '@jsonforms/core';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, StepperLayout, WidgetProps } from 'src/types';

import * as channelTransformer from './transformOktaVerifyChannelSelection';
import { transformOktaVerifyEnrollChannel } from './transformOktaVerifyEnrollChannel';

describe('TransformOktaVerifyEnrollChannel Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  let channelSelectFormBag: FormBag;
  let channelTransformerStub: jest.SpyInstance;

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

    channelTransformerStub = jest.spyOn(
      channelTransformer,
      'transformOktaVerifyChannelSelection',
    ).mockReturnValue(channelSelectFormBag);
  });

  afterEach(() => {
    channelTransformerStub.mockReset();
  });

  it('should append email input field to elements list when email is the selectedChannel', () => {
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
    formBag.uischema.elements.push({ type: 'Control', scope: '#/properties/email' } as ControlElement);

    const updatedFormBag = transformOktaVerifyEnrollChannel(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(4);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.content,
    ).toBe('oie.enroll.okta_verify.enroll.channel.email.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1] as ControlElement).scope,
    ).toBe('#/properties/email');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('oie.enroll.okta_verify.channel.email.description');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[3] as ControlElement).label,
    ).toEqual('oie.enroll.okta_verify.setupLink');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[3] as ControlElement).options?.idxStep,
    ).toEqual(IDX_STEP.ENROLLMENT_CHANNEL_DATA);
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

  it('should append phone input field to elements list when sms is the selectedChannel', () => {
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
    formBag.uischema.elements.push({ type: 'Control', scope: '#/properties/phoneNumber' } as ControlElement);

    const updatedFormBag = transformOktaVerifyEnrollChannel(transaction, formBag, mockProps);

    // Main Stepper
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    // Steps
    expect((updatedFormBag.uischema.elements[0] as StepperLayout).elements.length).toBe(2);
    // First step steps
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements.length,
    ).toBe(4);
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[0].options?.content,
    ).toBe('oie.enroll.okta_verify.enroll.channel.sms.title');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[1] as ControlElement).scope,
    ).toBe('#/properties/phoneNumber');
    expect(
      ((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[2].options?.content,
    ).toBe('oie.enroll.okta_verify.channel.sms.description');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[3] as ControlElement).label,
    ).toEqual('oie.enroll.okta_verify.setupLink');
    expect(
      (((updatedFormBag.uischema.elements[0] as StepperLayout).elements[0] as Layout)
        .elements[3] as ControlElement).options?.idxStep,
    ).toEqual(IDX_STEP.ENROLLMENT_CHANNEL_DATA);
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

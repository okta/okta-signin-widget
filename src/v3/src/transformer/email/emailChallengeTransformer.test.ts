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
import { IdxAuthenticator } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FormBag,
  LayoutType,
  StepperLayout,
  WidgetProps,
} from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import * as utils from '../utils';
import { transformEmailChallenge } from '.';

describe('EmailChallengeTransformer Tests', () => {
  const redactedEmail = 'fxxxe@xxx.com';
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;

  beforeEach(() => {
    jest.spyOn(utils, 'getCurrentTimestamp').mockReturnValue(123456789);
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should create email challenge UI elements when resend code is available', () => {
    transaction.nextStep = {
      name: '',
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            email: redactedEmail,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    const updatedFormBag = transformEmailChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe(LayoutType.STEPPER);
    expect(updatedFormBag.uischema.elements[0].options?.navButtonsConfig?.next?.variant).toBe('secondary');
    expect(updatedFormBag.uischema.elements[0].options?.key).toBeDefined();

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0] as Layout;

    expect(layoutOne.type).toBe(LayoutType.VERTICAL);
    expect(layoutOne.elements.length).toBe(3);

    expect(layoutOne.elements[2].type).toBe('Description');
    expect(layoutOne.elements[2].options?.content).toBe('next.email.challenge.informationalTextWithEmail');
    expect(layoutOne.elements[2].options?.contentParams?.[0]).toBe(redactedEmail);

    const layoutTwo = stepperElements[1] as Layout;

    expect(layoutTwo.type).toBe(LayoutType.VERTICAL);
    expect(layoutTwo.elements.length).toBe(5);
    expect(layoutTwo.elements[2].type).toBe('Description');
    expect(layoutTwo.elements[2].options?.content).toBe('next.email.challenge.informationalTextWithEmail');
    expect(layoutTwo.elements[2].options?.contentParams?.[0]).toBe(redactedEmail);

    expect(layoutTwo.elements[3].type).toBe('Control');
    expect((layoutTwo.elements[3] as ControlElement).label).toBe('email.enroll.enterCode');

    expect(layoutTwo.elements[4].options?.format).toBe('button');
    expect(layoutTwo.elements[4].options?.type).toBe(ButtonOptionType.SUBMIT);
  });

  it('should create email challenge UI elements when profile email is NOT available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: true,
      relatesTo: {
        value: {} as IdxAuthenticator,
      },
    };
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    const updatedFormBag = transformEmailChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0] as Layout;

    expect(layoutOne.elements.length).toBe(3);

    expect(layoutOne.elements[2].options?.content).toBe('next.email.challenge.informationalText');
    expect(layoutOne.elements[2].options?.contentParams?.[0]).toBeUndefined();

    const layoutTwo = stepperElements[1] as Layout;

    expect(layoutTwo.elements.length).toBe(5);
    expect(layoutTwo.elements[2].options?.content).toBe('next.email.challenge.informationalText');
    expect(layoutTwo.elements[2].options?.contentParams?.[0]).toBeUndefined();
  });

  it('should create email challenge UI elements when resend code is NOT available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            email: redactedEmail,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEmailChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe(LayoutType.STEPPER);
    expect(updatedFormBag.uischema.elements[0].options?.navButtonsConfig?.next?.variant).toBe('secondary');
    expect(updatedFormBag.uischema.elements[0].options?.key).toBeDefined();

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0] as Layout;

    expect(layoutOne.type).toBe(LayoutType.VERTICAL);
    expect(layoutOne.elements.length).toBe(2);

    expect(layoutOne.elements[1].type).toBe('Description');
    expect(layoutOne.elements[1].options?.content).toBe('next.email.challenge.informationalTextWithEmail');
    expect(layoutOne.elements[1].options?.contentParams?.[0]).toBe(redactedEmail);

    const layoutTwo = stepperElements[1] as Layout;

    expect(layoutTwo.type).toBe(LayoutType.VERTICAL);
    expect(layoutTwo.elements.length).toBe(4);
    expect(layoutTwo.elements[1].type).toBe('Description');
    expect(layoutTwo.elements[1].options?.content).toBe('next.email.challenge.informationalTextWithEmail');
    expect(layoutTwo.elements[1].options?.contentParams?.[0]).toBe(redactedEmail);

    expect(layoutTwo.elements[2].type).toBe('Control');
    expect((layoutTwo.elements[2] as ControlElement).label).toBe('email.enroll.enterCode');

    expect(layoutTwo.elements[3].options?.format).toBe('button');
    expect(layoutTwo.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
  });
});

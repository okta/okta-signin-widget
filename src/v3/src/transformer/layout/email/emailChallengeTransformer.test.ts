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

import { IdxAuthenticator, OktaAuth } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  StepperLayout,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformEmailChallenge } from '.';

describe.skip('EmailChallengeTransformer Tests', () => {
  const redactedEmail = 'fxxxe@xxx.com';
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {
    authClient: {
      idx: { proceed: jest.fn() },
    } as unknown as OktaAuth,
  };
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
    ];
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
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0];

    expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(layoutOne.elements.length).toBe(4);

    expect(layoutOne.elements[2].type).toBe('Description');
    expect((layoutOne.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

    const layoutTwo = stepperElements[1];

    expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(layoutTwo.elements.length).toBe(5);
    expect(layoutTwo.elements[2].type).toBe('Description');
    expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

    expect((layoutTwo.elements[3] as FieldElement).label).toBe('email.enroll.enterCode');

    expect((layoutTwo.elements[4] as ButtonElement).type).toBe('Button');
    expect((layoutTwo.elements[4] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
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
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0];

    expect(layoutOne.elements.length).toBe(4);

    expect((layoutOne.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');

    const layoutTwo = stepperElements[1];

    expect(layoutTwo.elements.length).toBe(5);
    expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');
  });

  it('should create email challenge UI elements when resend code is NOT available', () => {
    transaction.availableSteps = [];
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          profile: {
            email: redactedEmail,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformEmailChallenge({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

    const layoutOne = stepperElements[0];

    expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(layoutOne.elements.length).toBe(3);

    expect(layoutOne.elements[1].type).toBe('Description');
    expect((layoutOne.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

    const layoutTwo = stepperElements[1];

    expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(layoutTwo.elements.length).toBe(4);
    expect(layoutTwo.elements[1].type).toBe('Description');
    expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

    expect((layoutTwo.elements[2] as FieldElement).label).toBe('email.enroll.enterCode');

    expect((layoutTwo.elements[3] as ButtonElement).type).toBe('Button');
    expect((layoutTwo.elements[3] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
  });
});

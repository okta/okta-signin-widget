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

import { IdxAuthenticator, IdxTransaction } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  FormBag,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformEmailAuthenticatorVerify } from '.';

describe('Email Authenticator Verify Transformer Tests', () => {
  const redactedEmail = 'fxxxe@xxx.com';
  let widgetProps: WidgetProps;
  let transaction: IdxTransaction;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
    ];
    widgetProps = {};
  });

  describe('Email Magic Link = true', () => {
    beforeEach(() => {
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        currentAuthenticatorEnrollment: {
          type: '',
          value: {
            contextualData: { useEmailMagicLink: true },
          } as unknown as IdxAuthenticator,
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(1);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(4);

      expect((layoutOne.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutOne.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutOne.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutOne.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[2].type).toBe('Description');
      expect((layoutOne.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[3].type).toBe('StepperButton');
      expect((layoutOne.elements[3] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(5);
      expect((layoutTwo.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutTwo.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutTwo.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutTwo.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[2].type).toBe('Description');
      expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[4] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(4);

      expect((layoutOne.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutOne.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutOne.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutOne.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[2].type).toBe('Description');
      expect((layoutOne.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[3].type).toBe('StepperButton');
      expect((layoutOne.elements[3] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(5);
      expect((layoutTwo.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutTwo.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutTwo.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutTwo.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[2].type).toBe('Description');
      expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[4] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((layoutTwo.elements[4] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(1);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(3);

      expect((layoutOne.elements[0] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[1].type).toBe('Description');
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[2].type).toBe('StepperButton');
      expect((layoutOne.elements[2] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(4);
      expect((layoutTwo.elements[0] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[1].type).toBe('Description');
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[2] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[3] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[3] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((layoutTwo.elements[3] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
    });
  });

  describe('Email Magic Link = false', () => {
    beforeEach(() => {
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        currentAuthenticatorEnrollment: {
          type: '',
          value: {
            contextualData: { useEmailMagicLink: false },
          } as unknown as IdxAuthenticator,
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.verificationCode.instructions');

      expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
      expect((updatedFormBag.uischema.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
        .toBe(ButtonType.SUBMIT);
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((updatedFormBag.uischema.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.verificationCode.instructions');

      expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
      expect((updatedFormBag.uischema.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
        .toBe(ButtonType.SUBMIT);
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.verificationCode.instructions');

      expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
      expect((updatedFormBag.uischema.elements[3] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
        .toBe(ButtonType.SUBMIT);
    });
  });

  describe('Email Magic Link = undefined', () => {
    beforeEach(() => {
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        currentAuthenticatorEnrollment: {
          type: '',
          value: {} as unknown as IdxAuthenticator,
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(1);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(4);

      expect((layoutOne.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutOne.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutOne.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutOne.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[2].type).toBe('Description');
      expect((layoutOne.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[3].type).toBe('StepperButton');
      expect((layoutOne.elements[3] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(5);
      expect((layoutTwo.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutTwo.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutTwo.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutTwo.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[2].type).toBe('Description');
      expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[4] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(4);

      expect((layoutOne.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutOne.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutOne.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutOne.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[2].type).toBe('Description');
      expect((layoutOne.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[3].type).toBe('StepperButton');
      expect((layoutOne.elements[3] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(5);
      expect((layoutTwo.elements[0] as ReminderElement).options?.content)
        .toBe('email.code.not.received');
      expect((layoutTwo.elements[0] as ReminderElement).options?.actionParams?.resend)
        .toBe(true);
      expect((layoutTwo.elements[0] as ReminderElement).options?.step)
        .toBe('resend');
      expect((layoutTwo.elements[0] as ReminderElement).options?.isActionStep)
        .toBe(true);
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[2].type).toBe('Description');
      expect((layoutTwo.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[4] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[4] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((layoutTwo.elements[4] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
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
      const updatedFormBag = transformEmailAuthenticatorVerify({
        transaction, formBag, widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(1);
      expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

      const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;

      const layoutOne = stepperElements[0];

      expect(layoutOne.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutOne.elements.length).toBe(3);

      expect((layoutOne.elements[0] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutOne.elements[1].type).toBe('Description');
      expect((layoutOne.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');
      expect(layoutOne.elements[2].type).toBe('StepperButton');
      expect((layoutOne.elements[2] as StepperButtonElement).label)
        .toBe('oie.email.verify.alternate.show.verificationCode.text');

      const layoutTwo = stepperElements[1];

      expect(layoutTwo.type).toBe(UISchemaLayoutType.VERTICAL);
      expect(layoutTwo.elements.length).toBe(4);
      expect((layoutTwo.elements[0] as DescriptionElement).options?.content)
        .toBe('oie.email.mfa.title');
      expect(layoutTwo.elements[1].type).toBe('Description');
      expect((layoutTwo.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');

      expect((layoutTwo.elements[2] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');

      expect((layoutTwo.elements[3] as ButtonElement).type).toBe('Button');
      expect((layoutTwo.elements[3] as ButtonElement).label).toBe('mfa.challenge.verify');
      expect((layoutTwo.elements[3] as ButtonElement).options?.type).toBe(ButtonType.SUBMIT);
    });
  });
});

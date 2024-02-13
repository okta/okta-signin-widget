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

import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdentifierContainerElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorUnlockVerify } from '.';

const getMockAuthenticatorButtons = (): AuthenticatorButtonElement[] => {
  const authenticators = [];
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Email',
    options: {
      type: ButtonType.BUTTON,
      key: AUTHENTICATOR_KEY.EMAIL,
      ctaLabel: 'Select',
      actionParams: {
        'authenticator.id': '123abc',
      },
      ariaLabel: 'Select email.',
      step: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
    },
  } as AuthenticatorButtonElement);
  return authenticators;
};

jest.mock('./utils', () => ({
  getAuthenticatorVerifyButtonElements: (
    options: IdxOption[],
  ) => (options?.length ? getMockAuthenticatorButtons() : []),
}));

describe('Unlock Verification Authenticator Selector Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let widgetProps: WidgetProps = {} as unknown as WidgetProps;
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [{ type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
      inputs: [
        {
          name: 'authenticator',
          options: [
            {
              label: 'Email',
              value: 'okta_email',
            } as IdxOption,
          ],
        },
        {
          name: 'identifier',
          label: 'Username',
          required: true,
        },
      ],
    };
    widgetProps = { features: { rememberMe: false } } as unknown as WidgetProps;
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorUnlockVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
    };

    expect(transformSelectAuthenticatorUnlockVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should add UI elements for unlock account flow', () => {
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    const [identifyWithUsernameLayout, authenticatorListLayout] = stepperLayout.elements;
    const identifyWithUsernameElements = (identifyWithUsernameLayout as UISchemaLayout).elements;
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(identifyWithUsernameElements.length).toBe(3);
    expect((identifyWithUsernameElements[0] as TitleElement).options.content)
      .toBe('unlockaccount');
    expect((identifyWithUsernameElements[1] as FieldElement).options?.inputMeta.name)
      .toBe('identifier');
    expect((identifyWithUsernameElements[2] as StepperButtonElement).label)
      .toBe('oform.next');
    // StepperButton component was changed to support submit type for this transformer
    expect((identifyWithUsernameElements[2] as StepperButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);

    expect(authenticatorListElements.length).toBe(3);
    expect((authenticatorListElements[0] as TitleElement).options.content)
      .toBe('oie.select.authenticators.verify.title');
    expect((authenticatorListElements[1] as DescriptionElement).options.content)
      .toBe('oie.select.authenticators.verify.subtitle');
    expect(authenticatorListElements[2].type).toBe('AuthenticatorButtonList');
    expect(((authenticatorListElements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((authenticatorListElements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((authenticatorListElements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((authenticatorListElements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.step).toBe('select-authenticator-unlock-account');
    expect(((authenticatorListElements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.type).toBe(ButtonType.BUTTON);
  });

  it('should not add identifier container if identifier is empty string', () => {
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(3);
    expect(authenticatorListElements[0].type).not.toBe('IdentifierContainer');
  });

  it('should not add identifier container if transaction NextStep is "identify"', () => {
    transaction.nextStep = { ...transaction.nextStep, name: IDX_STEP.IDENTIFY };

    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(3);
    expect(authenticatorListElements[0].type).not.toBe('IdentifierContainer');
  });

  it('should not add identifier container if transaction NextStep is "admin-consent"', () => {
    transaction.nextStep = { ...transaction.nextStep, name: IDX_STEP.CONSENT_ADMIN };

    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(3);
    expect(authenticatorListElements[0].type).not.toBe('IdentifierContainer');
  });

  it('should not add identifier container when features.showIdentifier = false', () => {
    widgetProps = {
      features: { ...widgetProps.features, showIdentifier: false },
    } as unknown as WidgetProps;

    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(3);
    expect(authenticatorListElements[0].type).not.toBe('IdentifierContainer');
  });

  it('should not add identifier container when features.showIdentifier is undefined', () => {
    widgetProps = {
      features: { ...widgetProps.features, showIdentifier: undefined },
    } as unknown as WidgetProps;

    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(3);
    expect(authenticatorListElements[0].type).not.toBe('IdentifierContainer');
  });

  it('should add identifier container when features.showIdentifier = true', () => {
    formBag.data = { identifier: 'testUser@okta.com' };
    widgetProps = {
      features: { ...widgetProps.features, showIdentifier: true },
    } as unknown as WidgetProps;

    const updatedFormBag = transformSelectAuthenticatorUnlockVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Stepper');

    const stepperLayout = updatedFormBag.uischema.elements[0] as StepperLayout;
    expect(stepperLayout.elements.length).toBe(2);
    const authenticatorListLayout = stepperLayout.elements[1];
    const authenticatorListElements = (authenticatorListLayout as UISchemaLayout).elements;

    expect(authenticatorListElements.length).toBe(4);
    expect(authenticatorListElements[0].type).toBe('IdentifierContainer');
    expect((authenticatorListElements[0] as IdentifierContainerElement).options.identifier).toBe('testUser@okta.com');
  });
});

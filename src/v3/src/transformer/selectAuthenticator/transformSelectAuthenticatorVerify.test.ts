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
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorVerify } from '.';

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
      step: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    },
  } as AuthenticatorButtonElement);
  return authenticators;
};

jest.mock('./utils', () => ({
  getAuthenticatorVerifyButtonElements: (
    options?: IdxOption[],
  ) => (options?.length ? getMockAuthenticatorButtons() : []),
}));

describe('Verify Authenticator Selector Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let widgetProps: WidgetProps;
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      inputs: [{
        name: 'authenticator',
        options: [
          {
            label: 'Email',
            value: 'okta_email',
          } as IdxOption,
        ],
      }],
    };
    widgetProps = {} as unknown as WidgetProps;
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    };

    expect(transformSelectAuthenticatorVerify({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should add UI elements for verification authenticator selector'
    + ' when not in password recovery flow', () => {
    const updatedFormBag = transformSelectAuthenticatorVerify({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.select.authenticators.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.select.authenticators.verify.subtitle');
    expect(updatedFormBag.uischema.elements[2].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.step).toBe('select-authenticator-authenticate');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.type).toBe(ButtonType.BUTTON);
  });

  it('should add UI elements for verification authenticator selector'
    + ' when in password recovery flow', () => {
    transaction.rawIdxState = {
      // @ts-ignore OKTA-486472 (prop is missing from interface)
      recoveryAuthenticator: {
        type: 'object',
        value: {
          type: 'password',
        },
      },
    };
    const updatedFormBag = transformSelectAuthenticatorVerify({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.generic');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.password.reset.verification');
    expect(updatedFormBag.uischema.elements[2].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.step).toBe('select-authenticator-authenticate');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.type).toBe(ButtonType.BUTTON);
  });

  it('should add UI elements for verification authenticator selector'
    + ' when in password recovery flow and brand name is provided', () => {
    widgetProps = { brandName: 'Acme Corp.' } as unknown as WidgetProps;
    transaction.rawIdxState = {
      version: '',
      stateHandle: '',
      // @ts-ignore OKTA-486472 (prop is missing from interface)
      recoveryAuthenticator: {
        type: 'object',
        value: {
          type: 'password',
        },
      },
    };
    const updatedFormBag = transformSelectAuthenticatorVerify({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.specific');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.password.reset.verification');
    expect(updatedFormBag.uischema.elements[2].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.step).toBe('select-authenticator-authenticate');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.type).toBe(ButtonType.BUTTON);
  });
});
